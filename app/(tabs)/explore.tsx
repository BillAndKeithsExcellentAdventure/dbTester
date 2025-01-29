import { StyleSheet, Image, Platform, Button } from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { JobTrakrDB } from "jobdb";
import { useEffect, useState } from "react";
import { JobData, JobCategoryData, JobCategoryItemData } from "jobdb/dist/interfaces";

export default function TabTwoScreen() {
    const [db, setDb] = useState<JobTrakrDB | null>(null);

    useEffect(() => {
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
            } else {
                console.error(`Failed to initialize DB with status: ${status}`);
            }
        }

        initDb();
    }, []);

    const doDeleteDB = async () => {
        await db?.DeleteDatabase();
    };

    const doDeleteDBData = async () => {
        let newId = { value: 3n };
        const deleteStatus = await db?.GetJobDB().DeleteJob(newId.value);
        console.info(`Deleted job with id ${newId.value}. Status = ${deleteStatus}`);
    };

    const doCreateSampleData = async () => {
        console.info("Creating jobs...");

        await db?.CreateSampleData();
    };

    const exportDb = () => {
        console.info("exporting db");

        db?.CopyFileToDownloads();
        console.info("Done exporting db");
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
            headerImage={
                <IconSymbol
                    size={310}
                    color="#808080"
                    name="chevron.left.forwardslash.chevron.right"
                    style={styles.headerImage}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Explore</ThemedText>
                {db === null ? (
                    <ThemedText>Loading...</ThemedText>
                ) : (
                    <ThemedView style={styles.container}>
                        <Button
                            title="Create Sample Data"
                            onPress={doCreateSampleData}
                        />
                        <Button
                            title="Export Db"
                            onPress={exportDb}
                        />
                        <Button
                            title="Delete Db"
                            onPress={doDeleteDB}
                        />
                    </ThemedView>
                )}
            </ThemedView>
            <ThemedText>This app includes example code to help you get started.</ThemedText>
        </ParallaxScrollView>
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
        justifyContent: "center",
        alignItems: "center",
    },
    button: {
        margin: 10, // Add margin around the button
    },
});
