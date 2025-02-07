import { StyleSheet, Image, Platform, Button, ScrollView, View, TouchableOpacity } from "react-native";
import CheckBox from "@react-native-community/checkbox";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useEffect, useState } from "react";
import * as MediaLibrary from "expo-media-library";
import { Albums, MediaAssets } from "jobmedia";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { JobTrakrDB } from "jobdb";
import { JobData } from "jobdb/dist/interfaces";
import * as Location from "expo-location";

export default function NoIdeaHowThisWorks3() {
    const [pictures, setPictures] = useState<MediaLibrary.Asset[] | null>(null);
    const [state, setState] = useState<MediaLibrary.PermissionResponse | null>(null);
    const [mediaAssets, setMediaAssets] = useState<MediaAssets | null>(null);

    useEffect(() => {
        async function initMedia() {
            console.info("Initializing Media...");
            const response = await MediaLibrary.requestPermissionsAsync();
            setState(response);

            const mediaAssets = new MediaAssets();
            setMediaAssets(mediaAssets);

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.error("Permission to access location was denied");
                return null;
            }
        }

        initMedia();
    }, []);

    async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
        try {
            let location = await Location.getCurrentPositionAsync({});
            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
        } catch (error) {
            console.error(`Error getting current location: ${error}`);
            return null;
        }
    }

    const onPress = async () => {
        console.log("Pressed");

        const location = await getCurrentLocation();
        if (location) {
            const foundAssets: MediaLibrary.Asset[] | undefined = await mediaAssets?.getAllAssetsNearLocation(
                location.longitude,
                location.latitude,
                100
            );
            if (foundAssets) {
                console.log(`Found ${foundAssets.length} pictures`);
                setPictures(foundAssets);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Button
                title="Find Pictures near me"
                onPress={onPress}
            />
            <ScrollView style={styles.leftScroll}>
                {pictures ? (
                    pictures.map((asset) => (
                        <View key={asset.id}>
                            <ThemedText>{asset.filename}</ThemedText>
                            <Image
                                source={{
                                    uri: `${asset.uri}`,
                                }}
                                style={{
                                    width: 100,
                                    height: 100,
                                    resizeMode: "contain",
                                }}
                            />
                        </View>
                    ))
                ) : (
                    <ThemedText>Loading...</ThemedText>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: "#808080",
        bottom: -90,
        left: -35,
        position: "absolute",
    },
    titleContainer: {
        flexDirection: "row",
        gap: 8,
    },
    container: {
        flex: 1,
        marginTop: 40,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
        margin: 10,
    },
    button: {
        margin: 10, // Add margin around the button
    },
    leftScroll: {
        flex: 1,
        padding: 10,
    },
    rightScroll: {
        flex: 2,
        padding: 10,
    },
    checkbox: {
        alignSelf: "center",
    },
    label: {
        margin: 8,
    },
});
