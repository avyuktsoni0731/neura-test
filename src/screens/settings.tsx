import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ml', name: 'Malayalam' },
];

export default function SettingsScreen(){
    const { t, i18n } = useTranslation();
    const[notifications, setNotifications] = React.useState(true);
    const[darkMode, setDarkMode] = React.useState(false);
    const [showLanguageOptions, setShowLanguageOptions] = React.useState(false);

    const handleLanguageChange = async (languageCode: string) => {
        await changeLanguage(languageCode);
        setShowLanguageOptions(false);
    };

    const getLanguageName = (code: string) => {
        const lang = languages.find(l => l.code === code);
        return lang ? t(`settings.${lang.code.toLowerCase()}`) : code;
    };

    return(
        <View style={styles.container}>
            <Text style={styles.header}>{t('settings.title')}</Text>
            
            <View style={styles.row}>
                <Text style={styles.label}>{t('settings.notifications')}</Text>
                <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    thumbColor={notifications ? "#007bff" : "#ccc"}
                />
            </View>
            
            <View style={styles.row}>
                <Text style={styles.label}>{t('settings.darkMode')}</Text>
                <Switch
                    value={darkMode}
                    thumbColor={"#ccc"}
                    onValueChange={setDarkMode}
                />
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>{t('settings.language')}</Text>
                <TouchableOpacity
                    onPress={() => setShowLanguageOptions(!showLanguageOptions)}
                    style={styles.languageButton}
                >
                    <Text style={styles.languageText}>
                        {getLanguageName(i18n.language)}
                    </Text>
                    <Text style={styles.arrow}>{showLanguageOptions ? '▲' : '▼'}</Text>
                </TouchableOpacity>
            </View>

            {showLanguageOptions && (
                <View style={styles.languageOptions}>
                    {languages.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            style={[
                                styles.languageOption,
                                i18n.language === lang.code && styles.selectedLanguageOption
                            ]}
                            onPress={() => handleLanguageChange(lang.code)}
                        >
                            <Text style={[
                                styles.languageOptionText,
                                i18n.language === lang.code && styles.selectedLanguageOptionText
                            ]}>
                                {t(`settings.${lang.code.toLowerCase()}`)}
                            </Text>
                            {i18n.language === lang.code && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    header: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    label: {
        fontSize: 18,
    },
    languageButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    languageText: {
        fontSize: 18,
        color: "#007bff",
    },
    arrow: {
        fontSize: 12,
        color: "#007bff",
    },
    languageOptions: {
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: "#f8f9fa",
        borderRadius: 8,
        overflow: "hidden",
    },
    languageOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    selectedLanguageOption: {
        backgroundColor: "#e7f3ff",
    },
    languageOptionText: {
        fontSize: 16,
        color: "#333",
    },
    selectedLanguageOptionText: {
        color: "#007bff",
        fontWeight: "600",
    },
    checkmark: {
        fontSize: 18,
        color: "#007bff",
        fontWeight: "bold",
    },
});