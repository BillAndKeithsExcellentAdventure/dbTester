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

export default function NoIdeaHowThisWorks() {
    const [albums, setAlbums] = useState<MediaLibrary.Album[] | null>(null);
    const [assets, setAssets] = useState<MediaLibrary.Asset[] | null>(null);
    const [state, setState] = useState<MediaLibrary.PermissionResponse | null>(null);
    const [mediaAssets, setMediaAssets] = useState<MediaAssets | null>(null);
    const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
    const [db, setDb] = useState<JobTrakrDB | null>(null);
    const [jobs, setJobs] = useState<JobData[]>([]);
    const [currentJob, setCurrentJob] = useState<JobData | undefined>(undefined);
    const [isSetThumbnailSelected, setSetThumbnailSelection] = useState(false);

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

        async function initDb() {
            console.info("Initializing DB...");
            // the (1) is the UserId
            const myDb = new JobTrakrDB(1);
            const status = await myDb.OpenDatabase();
            if (status === "Success") {
                const db = myDb.GetDb();
                console.info("DB Initialized. Opening...");
                setDb(myDb);
                console.info("DB Initialized");
            }
        }

        initDb();

        initMedia();
    }, []);

    const onPressLoadJobs = async () => {
        const jobs = await db?.GetJobDB().FetchAllJobs();
        if (jobs?.status === "Success") {
            setJobs(jobs.jobs);
            console.info(`Fetched ${jobs.jobs.length} jobs`);
        } else {
            console.error(`Failed to fetch jobs with status: ${jobs?.status}`);
        }
    };

    const onJobPress = async (job: JobData) => {
        console.log(`Pressed job: ${job.Name}`);
        setCurrentJob(job);
    };

    const onPress = async (asset: MediaLibrary.Asset) => {
        console.log("Pressed");
        console.log(asset);

        if (isSetThumbnailSelected) {
            const tn = await mediaAssets?.createThumbnail(asset.uri, asset.id, 100, 100);

            if (tn) {
                console.log(`Ready to set thumbnail for job: ${currentJob?.Name}`);
                setThumbnail(tn);

                if (currentJob?._id !== undefined && currentJob?._id !== null) {
                    const status = await db?.GetJobDB().UpdateThumbnail(tn, currentJob._id);
                    console.info(`Updated thumbnail for job ${currentJob.Name}. Status = ${status}`);
                }
            }
        } else {
            if (currentJob?._id !== undefined && currentJob?._id !== null) {
                // Selecting a picture for the bucket.
                let id: { value: bigint } = { value: 0n };

                db?.GetPictureBucketDB().InsertPicture(id, currentJob?._id, asset);
            }
        }
    };

    const onPressNext = async () => {
        const assetsArray = await mediaAssets?.getNextAssetPage();
        if (assetsArray) {
            console.log(`   Next ${assetsArray.length} assets`);
            console.log(`Got onPressNext finished: ${JSON.stringify(assetsArray)}`);
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
            <ScrollView
                style={styles.leftScroll}
                contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ marginTop: 20 }}>
                    <Button
                        title="Load Jobs"
                        onPress={onPressLoadJobs}
                    />
                </View>
                <View style={styles.titleContainer}>
                    {isSetThumbnailSelected ? (
                        <>
                            <Button
                                title="Add Picture"
                                onPress={() => {
                                    console.log("SetPicture");
                                    setSetThumbnailSelection(false);
                                }}
                            />
                            <ThemedText>{"(Setting Thumbnail)"}</ThemedText>
                        </>
                    ) : (
                        <>
                            <Button
                                title="Set Thumbnail"
                                onPress={() => {
                                    console.log("Add Thumbnail");
                                    setSetThumbnailSelection(true);
                                }}
                            />
                            <ThemedText>{"(Adding Pictures)"}</ThemedText>
                        </>
                    )}
                </View>

                {jobs ? (
                    jobs.map((job) => (
                        <View key={job._id}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => onJobPress(job)}>
                                <ThemedText>{job.Name}</ThemedText>
                            </TouchableOpacity>
                            <Image
                                source={{
                                    uri: `data:image/jpeg;base64,${job.Thumbnail}`,
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
            <ScrollView
                style={styles.rightScroll}
                contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ marginTop: 20 }}>
                    <Button
                        title="Next"
                        onPress={onPressNext}
                    />
                </View>
                <View style={{ marginTop: 20 }}>
                    <Button
                        title="Previous"
                        onPress={onPressPrevious}
                    />
                </View>
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
