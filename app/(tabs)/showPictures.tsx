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

export default function NoIdeaHowThisWorks2() {
    const [albums, setAlbums] = useState<MediaLibrary.Album[] | null>(null);
    const [jobAssets, setJobAssets] = useState<MediaLibrary.Asset[] | null>(null);
    const [state, setState] = useState<MediaLibrary.PermissionResponse | null>(null);
    const [mediaAssets, setMediaAssets] = useState<MediaAssets | null>(null);
    const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
    const [db, setDb] = useState<JobTrakrDB | null>(null);
    const [jobs, setJobs] = useState<JobData[]>([]);
    const [currentJob, setCurrentJob] = useState<JobData | undefined>(undefined);

    useEffect(() => {
        async function initMedia() {
            console.info("Initializing Media...");
            const response = await MediaLibrary.requestPermissionsAsync();
            setState(response);

            const mediaAssets = new MediaAssets();
            setMediaAssets(mediaAssets);
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
        const { status, jobs } = (await db?.GetJobDB().FetchAllJobs()) ?? { status: "Failed", jobs: [] };

        if (status === "Success") {
            setJobs(jobs);
            console.info(`Fetched ${jobs.length} jobs`);
        } else {
            console.error(`Failed to fetch jobs with status: ${status}`);
        }
    };

    const onJobPress = async (job: JobData) => {
        console.log(`Pressed job: ${job.Name}`);
        if (job) {
            setCurrentJob(job);
            let localAssets: MediaLibrary.Asset[] = [];
            const status = await db?.GetPictureBucketDB().FetchJobAssets(job?._id, localAssets);
            console.log(`Fetched ${localAssets.length} assets for job ${job.Name}`);
            setJobAssets(localAssets);
        }
    };

    const onPress = async (asset: MediaLibrary.Asset) => {
        console.log("Pressed");
        console.log(`    ${asset}`);
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
                {jobAssets ? (
                    jobAssets.map((asset) => (
                        <View key={asset.id}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => onPress(asset)}>
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
