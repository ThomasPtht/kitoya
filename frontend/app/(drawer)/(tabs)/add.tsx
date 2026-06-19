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
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Colors } from "@/constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { searchTeams } from "@/services/footballService";
import { useCreateJersey } from "@/hooks/useJerseyHook";

// 1. 📜 SCHÉMA DE VALIDATION ZOD
const jerseySchema = z.object({
  clubName: z.string().min(2, { message: "Club or Country name is required" }),
  season: z.string().min(4, { message: "Season is required (e.g., 2004)" }),
  size: z.string().min(1, { message: "Please select a size" }),
  type: z.string().min(1, { message: "Please select a kit type" }),
  playerName: z.string().optional(),
  number: z.string().optional(),
  frontImageUri: z.string().min(1, { message: "Front image is required" }),
  backImageUri: z.string().optional().nullable(),
  description: z.string().optional(),
  version: z.string().optional(),
  condition: z.string().optional(),
});

type JerseyFormValues = z.infer<typeof jerseySchema>;

const SIZES = ["S", "M", "L", "XL", "XXL"];
const TYPES = ["Home", "Away", "Third", "Special"];

export default function TabAddScreen() {
  // TODO: Remplacer plus tard par la fonction expo-image-picker pour permettre à l'utilisateur de choisir une photo de son kit

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const [frontImage, setFrontImage] = useState<string>("");
  const [backImage, setBackImage] = useState<string | null>(null);

  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [selectedSportId, setSelectedSportId] = useState<string>("");
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

  const handlePickFrontImage = () => {
    alert("Front photo picker will be implemented here later!");
    setFrontImage("placeholder_front_uri");
  };

  const handlePickBackImage = () => {
    alert("Back photo picker will be implemented here later!");
    setBackImage("placeholder_back_uri");
  };

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = async (text: string) => {
    // if user types again before the timeout, clear the previous timeout
    timeoutRef.current = setTimeout(async () => {
      if (text.length >= 3) {
        setIsLoading(true);
        const results = await searchTeams(text);
        setSuggestions(results);
        setIsDropdownVisible(results.length > 0);
        setIsLoading(false);
      }
    }, 500); // Wait for 500ms after the user stops typing before making the API call
  };

  // hook initialization
  const { mutate: createJersey, isPending } = useCreateJersey();

  // Form Submission handler
  const onSubmit = (data: JerseyFormValues) => {
    createJersey(
      {
        ...data,
        number: data.number ? parseInt(data.number, 10) : undefined,
        frontImageUri: frontImage,
        backImageUri: backImage,
        sportId: selectedSportId, // Assuming you have a way to get the selected sport ID
        clubId: selectedClubId, // Assuming you have a way to get the selected club ID
      },
      {
        onSuccess: () => {
          alert("Jersey added successfully!");
          reset();
          setFrontImage("");
          setBackImage(null);
        },
        onError: (error) => {
          console.error("Error creating jersey:", error);
          alert("Failed to add jersey. Please try again.");
        },
      },
    );
  };

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
              !frontImage && styles.imagePickerRequired,
            ]}
            onPress={handlePickFrontImage}
          >
            <FontAwesome name="camera" size={20} color="#8E8E93" />
            <Text style={styles.imagePickerText}>Front View *</Text>
          </TouchableOpacity>

          {/* Back button */}
          <TouchableOpacity
            style={styles.imagePickerHalf}
            onPress={handlePickBackImage}
          >
            <FontAwesome name="camera" size={20} color="#8E8E93" />
            <Text style={styles.imagePickerText}>Back View</Text>
            <Text style={styles.imagePickerSubtext}>(Optional)</Text>
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
                  setSelectedSportId(item.sportId);
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
              {TYPES.map((t) => (
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
                    {t}
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
            <TextInput
              style={styles.input}
              placeholder="e.g., New with tags, Used, Good"
              placeholderTextColor="#8E8E93"
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        {/* Version */}
        <Text style={styles.label}>Version</Text>
        <Controller
          control={control}
          name="version"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="e.g., Replica, Authentic, Player Issue"
              placeholderTextColor="#8E8E93"
              onChangeText={onChange}
              value={value}
            />
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
              placeholder="Any details about the jersey..."
              placeholderTextColor="#8E8E93"
              multiline
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        {/* Submit button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.submitButtonText}>Add to Locker</Text>
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
});
