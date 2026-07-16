import { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Colors } from "@/constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useCreateJersey, useSports } from "@/hooks/useJerseyHook";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { searchClubs } from "@/services/football.service";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

// 1. 📜 SCHÉMA DE VALIDATION ZOD
const jerseySchema = z.object({
  clubName: z.string().min(2, { message: "Club or Country name is required" }),
  season: z.string().min(4, { message: "Season is required (e.g., 2004)" }),
  size: z.string().min(1, { message: "Please select a size" }),
  type: z.string().min(1, { message: "Please select a kit type" }),
  purchasePrice: z.number().optional().nullable(),
  isOfficial: z.boolean().optional(),
  playerName: z.string().optional(),
  number: z.string().optional(),
  frontImageUri: z.string().min(1, { message: "Front image is required" }),
  backImageUri: z.string().optional().nullable(),
  description: z.string().optional(),
  version: z.string().min(1, { message: "Please select a version" }),
  condition: z.string().min(1, { message: "Please select a condition" }),
});

type JerseyFormValues = z.infer<typeof jerseySchema>;

const SPORTS = [
  "Football",
  "Basketball",
  "Baseball",
  "Hockey",
  "Foot US",
  "Rugby",
];
const SIZES = ["S", "M", "L", "XL", "XXL"];
export const JERSEY_TYPES_MAP: Record<string, string> = {
  HOME: "Home",
  AWAY: "Away",
  THIRD: "Third",
  FOURTH: "Fourth",
  SPECIAL: "Special",
  GOALKEEPER: "Goalkeeper",
  TRAINING: "Training",
};

export const KIT_CONDITIONS_MAP: Record<string, string> = {
  NEW_WITH_TAGS: "New with Tags",
  EXCELLENT: "Excellent",
  VERY_GOOD: "Very Good",
  GOOD: "Good",
  FAIR: "Fair",
};

export const KIT_VERSIONS_MAP: Record<string, string> = {
  REPLICA: "Replica",
  AUTHENTIC: "Authentic",
  PLAYER_ISSUE: "Player Issue",
  MATCH_WORN: "Match Worn",
};

// On génère les listes automatiquement à partir des clés du mapping
const JERSEY_TYPES = Object.keys(JERSEY_TYPES_MAP) as Array<
  keyof typeof JERSEY_TYPES_MAP
>;
const KIT_CONDITIONS = Object.keys(KIT_CONDITIONS_MAP) as Array<
  keyof typeof KIT_CONDITIONS_MAP
>;
const KIT_VERSIONS = Object.keys(KIT_VERSIONS_MAP) as Array<
  keyof typeof KIT_VERSIONS_MAP
>;

export default function TabAddScreen() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [, setIsLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const [frontImage, setFrontImage] = useState<string>("");
  const [backImage, setBackImage] = useState<string | null>(null);

  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [selectedSportId, setSelectedSportId] = useState<string>("");

  const { data: sports, isLoading } = useSports();
  console.log("DEBUG SPORTS:", { sports, isLoading });

  useFocusEffect(
    useCallback(() => {
      // this function runs when we enter the screen

      return () => {
        // this function runs when we leave the screen
        reset(); // reset the form when leaving the screen
        setFrontImage("");
        setBackImage(null);
        setSelectedClubId("");
        setSelectedSportId("");
        setSuggestions([]);
        setIsDropdownVisible(false);
      };
    }, []),
  );

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<JerseyFormValues>({
    resolver: zodResolver(jerseySchema),
    defaultValues: {
      clubName: "",
      season: "",
      size: "",
      type: "",
      playerName: "",
      number: undefined,
      frontImageUri: "",
      backImageUri: null,
      description: "",
    },
  });

  const handlePickFrontImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setFrontImage(uri);
      setValue("frontImageUri", uri, { shouldValidate: true });
    }
  };

  const handlePickBackImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setBackImage(result.assets[0].uri);
    }
  };

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = async (text: string) => {
    // if user types again before the timeout, clear the previous timeout
    timeoutRef.current = setTimeout(async () => {
      if (text.length >= 3) {
        setIsLoading(true);
        const results = await searchClubs(text, selectedSportId || "");
        setSuggestions(results);
        setIsDropdownVisible(results.length > 0);
        setIsLoading(false);
      }
    }, 500); // Wait for 500ms after the user stops typing before making the API call
  };

  // hook initialization
  const { mutate: createJersey, isPending } = useCreateJersey();

  // Form Submission handler
  const onSubmit = async (data: JerseyFormValues) => {
    const formData = new FormData();

    // Ajoutez les IDs manuellement (une seule fois suffit)
    if (selectedSportId) formData.append("sportId", selectedSportId);
    if (selectedClubId) formData.append("clubId", selectedClubId);

    // Liste des champs à ignorer dans la boucle car gérés manuellement
    const fieldsToIgnore = [
      "frontImageUri",
      "backImageUri",
      "sportId",
      "clubId",
    ];

    Object.entries(data).forEach(([key, value]) => {
      if (
        !fieldsToIgnore.includes(key) &&
        value !== undefined &&
        value !== null
      ) {
        formData.append(key, String(value));
      }
    });

    // Ajout des fichiers
    if (frontImage) {
      formData.append("frontImage", {
        uri: frontImage,
        name: "front.jpg",
        type: "image/jpeg",
      } as any);
    }

    if (backImage) {
      formData.append("backImage", {
        uri: backImage,
        name: "back.jpg",
        type: "image/jpeg",
      } as any);
    }

    try {
      await createJersey(formData);
      Toast.show({
        type: "success",
        text1: "Jersey added",
        text2: "The jersey has been added to your collection.",
        position: "bottom",
      });

      reset(); // Reset the form after successful submission
      setFrontImage("");
      setBackImage(null);
      setSelectedClubId("");
      setSelectedSportId("");
      router.navigate("/(drawer)/(tabs)/dressing");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error adding jersey",
        text2: "There was an error adding the jersey. Please try again.",
        position: "bottom",
      });
      console.error("Error creating jersey:", error);
    }
  };

  // Trouvez l'ID du sport "Football" automatiquement
  const footballSportId = sports?.find(
    (s) => s.name.toLowerCase() === "football",
  )?.id;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>ADD NEW JERSEY</Text>

        {/* Image */}
        {/* face button */}
        <View style={styles.imagePickerRow}>
          <TouchableOpacity
            style={[
              styles.imagePickerHalf,
              frontImage && styles.imagePickerFilled,
            ]}
            onPress={handlePickFrontImage}
          >
            {frontImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: frontImage }}
                  style={styles.imagePreview}
                />
                <View style={styles.overlay}>
                  <AntDesign
                    name="check-circle"
                    size={24}
                    color={Colors.theme.primary}
                  />
                  <Text style={styles.changeText}>Change</Text>
                </View>
              </View>
            ) : (
              // État vide
              <>
                <FontAwesome name="camera" size={20} color="#8E8E93" />
                <Text style={styles.imagePickerText}>Front View *</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Back button */}
          <TouchableOpacity
            style={[
              styles.imagePickerHalf,
              backImage && styles.imagePickerFilled,
            ]}
            onPress={handlePickBackImage}
          >
            {backImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: backImage }}
                  style={styles.imagePreview}
                />
                <View style={styles.overlay}>
                  <AntDesign
                    name="check-circle"
                    size={24}
                    color={Colors.theme.primary}
                  />
                  <Text style={styles.changeText}>Change</Text>
                </View>
              </View>
            ) : (
              <>
                <FontAwesome name="camera" size={20} color="#8E8E93" />
                <Text style={styles.imagePickerText}>Back View</Text>
                <Text style={styles.imagePickerSubtext}>(Optional)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Sport *</Text>
        <View style={styles.chipRow}>
          {sports?.map((sport: any) => {
            // Optionnel : Si vous voulez pré-sélectionner le premier sport ou le Football
            // const isDefault = !selectedSportId && sport.name === 'Football';

            const isSelected = selectedSportId === sport.id;

            return (
              <TouchableOpacity
                key={sport.id}
                activeOpacity={0.7}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedSportId(sport.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {sport.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Club input */}
        <Text style={styles.label}>Club / National Team *</Text>
        <Controller
          control={control}
          name="clubName"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.clubName && styles.inputError]}
              placeholder="e.g., France, Real Madrid, Arsenal"
              placeholderTextColor="#8E8E93"
              value={value}
              onChangeText={(text) => {
                onChange(text);

                if (text.length < 3) {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  setSuggestions([]);
                  setIsDropdownVisible(false);
                } else {
                  handleSearch(text);
                }
              }}
            />
          )}
        />
        {errors.clubName && (
          <Text style={styles.errorText}>{errors.clubName.message}</Text>
        )}

        {console.log("Données reçues dans le composant :", suggestions)}

        {/* Suggestions List */}
        {isDropdownVisible && suggestions.length > 0 && (
          <View style={styles.dropdown}>
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setValue("clubName", item.name);
                  setSelectedClubId(item.id);
                  if (footballSportId) {
                    setSelectedSportId(footballSportId);
                  }

                  setIsDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Season input*/}
        <Text style={styles.label}>Season *</Text>
        <Controller
          control={control}
          name="season"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.season && styles.inputError]}
              placeholder="e.g., 1998, 2004-2005"
              placeholderTextColor="#8E8E93"
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.season && (
          <Text style={styles.errorText}>{errors.season.message}</Text>
        )}

        {/* Size selector */}
        <Text style={styles.label}>Size *</Text>
        <Controller
          control={control}
          name="size"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipRow}>
              {SIZES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, value === s && styles.chipSelected]}
                  onPress={() => onChange(s)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      value === s && styles.chipTextSelected,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        {errors.size && (
          <Text style={styles.errorText}>{errors.size.message}</Text>
        )}

        {/*  Type selector */}
        <Text style={styles.label}>Kit Type *</Text>
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipRow}>
              {JERSEY_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, value === t && styles.chipSelected]}
                  onPress={() => onChange(t)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      value === t && styles.chipTextSelected,
                    ]}
                  >
                    {JERSEY_TYPES_MAP[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        {errors.type && (
          <Text style={styles.errorText}>{errors.type.message}</Text>
        )}

        <View style={styles.separator} />

        {/* player */}
        <Text style={styles.label}>Player Name (Optional)</Text>
        <Controller
          control={control}
          name="playerName"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="e.g., Zidane, Henry"
              placeholderTextColor="#8E8E93"
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        {/* jersey number */}
        <Text style={styles.label}>Number (Optional)</Text>
        <Controller
          control={control}
          name="number"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="e.g., 10, 14"
              placeholderTextColor="#8E8E93"
              keyboardType="number-pad"
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        {/* Condition */}
        <Text style={styles.label}>Condition</Text>
        <Controller
          control={control}
          name="condition"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipRow}>
              {KIT_CONDITIONS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, value === t && styles.chipSelected]}
                  onPress={() => onChange(t)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      value === t && styles.chipTextSelected,
                    ]}
                  >
                    {KIT_CONDITIONS_MAP[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        {/* {errors.condition && (
          <Text style={styles.errorText}>{errors.condition.message}</Text>
        )} */}

        {/* Version */}
        <Text style={styles.label}>Version</Text>
        <Controller
          control={control}
          name="version"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipRow}>
              {KIT_VERSIONS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, value === t && styles.chipSelected]}
                  onPress={() => onChange(t)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      value === t && styles.chipTextSelected,
                    ]}
                  >
                    {KIT_VERSIONS_MAP[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              placeholder="Add your memories, stories, or any details about this jersey..."
              placeholderTextColor="#8E8E93"
              multiline
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        {/* Submit button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isPending && styles.submitButtonDisabled,
          ]}
          disabled={isPending}
          onPress={handleSubmit(
            (data) => {
              onSubmit(data);
            },
            (errors) => {
              console.error(
                "❌ Erreurs de validation Zod trouvées :",
                JSON.stringify(errors, null, 2),
              );
            },
          )}
        >
          {isPending ? (
            <Text style={styles.submitButtonText}>Submitting...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Add to Locker</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.theme.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },
  heading: {
    color: Colors.theme.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 25,
    letterSpacing: 1,
  },
  imagePicker: {
    width: "100%",
    height: 120,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    borderStyle: "dashed",
    marginBottom: 20,
  },
  imagePickerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  imagePickerSubtext: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 2,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.theme.surface,
    color: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    marginBottom: 4,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: Colors.theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  chipSelected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  chipText: {
    color: "#8E8E93",
    fontWeight: "600",
    fontSize: 14,
  },
  chipTextSelected: {
    color: "#000000",
  },
  separator: {
    height: 1,
    backgroundColor: "#1A1A1A",
    marginVertical: 20,
  },
  submitButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 25,
  },
  submitButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
  submitButtonDisabled: {
    backgroundColor: "#A0CFFF",
    opacity: 0.6,
  },
  imagePickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  imagePickerHalf: {
    width: "48%",
    height: 120,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    borderStyle: "dashed",
  },
  imagePickerRequired: {
    borderColor: "#2C2C2E",
  },
  dropdown: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  dropdownText: {
    color: "#FFFFFF",
  },
  imagePickerFilled: {
    borderWidth: 1,
    borderColor: Colors.theme.primary,
    padding: 0,
  },
  imagePreviewContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  changeText: {
    color: "#FFF",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "bold",
  },
});
