import { useState, useEffect, useCallback } from "react";
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
  Switch,
  Alert,
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
import { BRANDS } from "@/constants/Jerseys";
import { useDebounce } from "@/hooks/useDebounce";

// 1. 📜 SCHÉMA DE VALIDATION ZOD
const jerseySchema = z.object({
  clubId: z.string().optional().nullable(),
  clubName: z.string().min(2, { message: "Club or Country name is required" }),
  season: z.string().min(4, { message: "Season is required (e.g., 2004)" }),
  size: z.string().min(1, { message: "Please select a size" }),
  type: z.string().min(1, { message: "Please select a kit type" }),
  purchasePrice: z.number().optional().nullable(),
  isOfficial: z.boolean().default(true),
  playerName: z.string().optional(),
  number: z.string().optional(),
  frontImageUri: z.string().min(1, { message: "Front image is required" }),
  backImageUri: z.string().optional().nullable(),
  description: z.string().optional(),
  version: z.string().min(1, { message: "Please select a version" }),
  condition: z.string().min(1, { message: "Please select a condition" }),

  brand: z.string().min(1, { message: "Please select a brand" }),
});

type JerseyFormValues = z.infer<typeof jerseySchema>;

const SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];
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

  const isValidUuid = (value?: string | null) => {
    if (!value) return false;
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  };

  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [isBrandDropdownVisible, setIsBrandDropdownVisible] = useState(false);

  const { data: sports } = useSports();

  // Un seul sport disponible dans l'app pour l'instant : Football.
  // Assigné automatiquement, aucune sélection requise de l'utilisateur.
  const footballSportId = sports?.find(
    (s: { name: string }) => s.name.toLowerCase() === "football",
  )?.id;

  useEffect(() => {
    if (footballSportId) {
      setSelectedSportId(footballSportId);
    }
  }, [footballSportId]);

  const [clubSearchInput, setClubSearchInput] = useState<string>("");
  const debouncedClubSearch = useDebounce(clubSearchInput, 500);

  // Ce useEffect s'exécute automatiquement 500ms après la dernière frappe
  useFocusEffect(
    useCallback(() => {
      const fetchClubs = async () => {
        // SÉCURITÉ : On bloque si le sport n'est pas prêt ou si la recherche est trop courte
        if (
          !selectedSportId ||
          !debouncedClubSearch ||
          debouncedClubSearch.trim().length < 3
        ) {
          setSuggestions([]);
          setIsDropdownVisible(false);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        try {
          const results = await searchClubs(
            debouncedClubSearch,
            selectedSportId, // Garanti non vide ici
          );
          setSuggestions(results);
          setIsDropdownVisible(results.length > 0);
        } catch (error) {
          console.error("Erreur recherche club", error);
          setSuggestions([]);
          setIsDropdownVisible(false);
        } finally {
          setIsLoading(false);
        }
      };

      fetchClubs();
    }, [debouncedClubSearch, selectedSportId]),
  );

  const handleBrandSearch = (text: string) => {
    if (text.length >= 2) {
      const filtered = BRANDS.filter((brand) =>
        brand.toLowerCase().includes(text.toLowerCase()),
      );
      setBrandSuggestions(filtered);
      setIsBrandDropdownVisible(filtered.length > 0);
    } else {
      setBrandSuggestions([]);
      setIsBrandDropdownVisible(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        reset();
        setFrontImage("");
        setBackImage(null);
        setSelectedClubId("");
        // On NE reset PAS selectedSportId : il est réassigné automatiquement
        // par le useEffect dès que l'écran reprend le focus et que `sports` est chargé.
        setSuggestions([]);
        setIsDropdownVisible(false);
        setIsBrandDropdownVisible(false);
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
  } = useForm({
    resolver: zodResolver(jerseySchema),
    defaultValues: {
      clubId: "",
      clubName: "",
      season: "",
      size: "",
      type: "",
      purchasePrice: null,
      isOfficial: true,
      playerName: "",
      number: undefined,
      frontImageUri: "",
      backImageUri: null,
      description: "",
      condition: "",
      version: "",
      brand: "",
    },
  });

  const applySelectedImage = (uri: string, target: "front" | "back") => {
    if (target === "front") {
      setFrontImage(uri);
      setValue("frontImageUri", uri, { shouldValidate: true });
    } else {
      setBackImage(uri);
      setValue("backImageUri", uri, { shouldValidate: true });
    }
  };

  const pickImage = async (target: "front" | "back") => {
    Alert.alert("Add image", "Choose an image source", [
      {
        text: "Take photo",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Toast.show({
              type: "error",
              text1: "Camera permission required",
              text2: "Please allow camera access to take a photo.",
            });
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

          if (!result.canceled) {
            applySelectedImage(result.assets[0].uri, target);
          }
        },
      },
      {
        text: "Choose from gallery",
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Toast.show({
              type: "error",
              text1: "Gallery permission required",
              text2: "Please allow photo access to choose an image.",
            });
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

          if (!result.canceled) {
            applySelectedImage(result.assets[0].uri, target);
          }
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handlePickFrontImage = () => pickImage("front");
  const handlePickBackImage = () => pickImage("back");

  const { mutate: createJersey, isPending } = useCreateJersey();

  // Form Submission handler
  const onSubmit = async (data: JerseyFormValues) => {
    const formData = new FormData();

    if (selectedSportId) formData.append("sportId", selectedSportId);
    if (selectedClubId && isValidUuid(selectedClubId)) {
      formData.append("clubId", selectedClubId);
    }

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

      reset();
      setFrontImage("");
      setBackImage(null);
      setSelectedClubId("");
      router.navigate("/(drawer)/(tabs)/dressing");
    } catch (error) {
      const err = error as any;
      Toast.show({
        type: "error",
        text1: "Error adding jersey",
        text2: "There was an error adding the jersey. Please try again.",
        position: "bottom",
      });
      console.error("Error creating jersey:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Add New Jersey</Text>

        <Text style={styles.imageHint}>
          Tip: lay the jersey flat on a bed or floor for the best photo.
        </Text>

        {/* Image Pickers */}
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
              <>
                <FontAwesome name="camera" size={20} color="#8E8E93" />
                <Text style={styles.imagePickerText}>Front View *</Text>
              </>
            )}
          </TouchableOpacity>

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
                onChange(text); // update the form value
                setClubSearchInput(text); // Trigger the debounced search
              }}
            />
          )}
        />
        {errors.clubName && (
          <Text style={styles.errorText}>{errors.clubName.message}</Text>
        )}

        {/* Suggestions List */}
        {isDropdownVisible && suggestions.length > 0 && (
          <View style={styles.dropdown}>
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.dropdownItem}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => {
                  setValue("clubName", item.name);
                  setSelectedClubId(item.id);
                  setIsDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Season input */}
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

        {/* Brand selector */}
        <View style={{ position: "relative", zIndex: 50 }}>
          <Text style={styles.label}>Brand *</Text>
          <Controller
            control={control}
            name="brand"
            render={({ field: { onChange, value } }) => (
              <View style={{ position: "relative" }}>
                <TextInput
                  style={[styles.input, errors.brand && styles.inputError]}
                  placeholder="e.g., Nike, Adidas"
                  placeholderTextColor="#8E8E93"
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    handleBrandSearch(text);
                  }}
                />

                {/* Dropdown des suggestions */}
                {isBrandDropdownVisible && brandSuggestions.length > 0 && (
                  <View style={styles.brandDropdown}>
                    <ScrollView
                      nestedScrollEnabled={true}
                      style={{ maxHeight: 150 }}
                      keyboardShouldPersistTaps="handled"
                    >
                      {brandSuggestions.map((item) => (
                        <TouchableOpacity
                          key={item}
                          style={styles.dropdownItem}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          onPress={() => {
                            onChange(item);
                            setIsBrandDropdownVisible(false);
                          }}
                        >
                          <Text style={styles.dropdownText}>{item}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}
          />
          {errors.brand && (
            <Text style={styles.errorText}>{errors.brand.message}</Text>
          )}
        </View>

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

        {/* Type selector */}
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

        {/* Prix d'achat (Purchase Price) */}
        <Text style={styles.label}>Purchase Price (Optional)</Text>
        <Controller
          control={control}
          name="purchasePrice"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="e.g., 89.99"
              placeholderTextColor="#8E8E93"
              keyboardType="numeric"
              onChangeText={(text) =>
                onChange(text ? parseFloat(text.replace(",", ".")) : null)
              }
              value={value !== null && value !== undefined ? String(value) : ""}
            />
          )}
        />

        <View style={styles.separator} />

        {/* Player */}
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

        {/* Jersey Number */}
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
              onChangeText={(text) => onChange(text === "" ? undefined : text)}
              value={value ?? ""}
            />
          )}
        />

        {/* Condition */}
        <Text style={styles.label}>Condition *</Text>
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
        {errors.condition && (
          <Text style={styles.errorText}>{errors.condition.message}</Text>
        )}

        {/* Version */}
        <Text style={styles.label}>Version *</Text>
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
        {errors.version && (
          <Text style={styles.errorText}>{errors.version.message}</Text>
        )}

        {/* Produit officiel (Is Official) */}
        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.labelInline}>Official Product</Text>
            <Text style={styles.subLabel}>
              Toggle off if it's a remake/copy
            </Text>
          </View>
          <Controller
            control={control}
            name="isOfficial"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value ?? true}
                onValueChange={onChange}
                trackColor={{ false: "#2C2C2E", true: Colors.theme.primary }}
                thumbColor="#FFFFFF"
              />
            )}
          />
        </View>

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
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 25,
    letterSpacing: 1,
  },
  imageHint: {
    color: "#8E8E93",
    fontSize: 12,
    marginBottom: 10,
    fontStyle: "italic",
  },
  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  labelInline: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  subLabel: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 2,
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
    backgroundColor: Colors.theme.primary,
    borderColor: Colors.theme.primary,
  },
  chipText: {
    color: "#8E8E93",
    fontWeight: "600",
    fontSize: 14,
  },
  chipTextSelected: {
    color: "#000000",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 4,
    paddingVertical: 4,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#1A1A1A",
    marginVertical: 20,
  },
  submitButton: {
    backgroundColor: Colors.theme.primary,
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
  dropdown: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    maxHeight: 200,
  },
  brandDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    maxHeight: 180,
    zIndex: 1000,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
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
  imagePickerText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  imagePickerSubtext: {
    color: "#8E8E93",
    fontSize: 11,
  },
});
