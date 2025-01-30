import { StyleSheet, Image, Platform, Button, ScrollView, View, TouchableOpacity } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useEffect, useState } from "react";
import * as MediaLibrary from "expo-media-library";
import { Albums, MediaAssets } from "jobmedia";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function NoIdeaHowThisWorks() {
    const [albums, setAlbums] = useState<MediaLibrary.Album[] | null>(null);
    const [assets, setAssets] = useState<MediaLibrary.Asset[] | null>(null);
    const [state, setState] = useState<MediaLibrary.PermissionResponse | null>(null);
    const [mediaAssets, setMediaAssets] = useState<MediaAssets | null>(null);

    useEffect(() => {
        async function initMedia() {
            console.info("Initializing Media...");
            const response = await MediaLibrary.requestPermissionsAsync();
            setState(response);

            const mediaAssets = new MediaAssets();
            setMediaAssets(mediaAssets);
            const assetsArray = await mediaAssets?.getFirstAssetPage(10);
            console.log(`Got getFirstAssetPage finished: ${assetsArray}`);
            if (assetsArray) {
                console.log(`Got ${assetsArray.length} assets`);
                setAssets(assetsArray);
            }
        }

        initMedia();
    }, []);

    const onPress = (asset: MediaLibrary.Asset) => {
        console.log("Pressed");
        console.log(asset);
    };

    const onPressNext = async () => {
        const assetsArray = await mediaAssets?.getNextAssetPage();
        if (assetsArray) {
            console.log(`   Next ${assetsArray.length} assets`);
            setAssets(assetsArray);
        }
    };

    const onPressPrevious = async () => {
        const assetsArray = await mediaAssets?.getPreviousAssetPage();
        console.log(`Got getPreviousAssetPage finished: ${JSON.stringify(assetsArray)}`);
        if (assetsArray !== undefined) {
            console.log(`   Previous ${assetsArray.length} assets`);
            setAssets(assetsArray);
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ marginTop: 40 }}>
                <Button
                    title="Next"
                    onPress={onPressNext}
                />
            </View>
            <View style={{ marginTop: 40 }}>
                <Button
                    title="Previous"
                    onPress={onPressPrevious}
                />
            </View>
            <ScrollView
                style={{ flex: 1, marginTop: 40 }}
                contentContainerStyle={{ flexGrow: 1 }}>
                {assets ? (
                    assets.map((asset) => (
                        <View key={asset.id}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => onPress(asset)}>
                                <ThemedText>{asset.filename}</ThemedText>
                            </TouchableOpacity>
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
});
