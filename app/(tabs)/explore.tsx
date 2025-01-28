import { StyleSheet, Image, Platform, Button } from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { JobTrakrDB, JobData } from "jobdb";
import { useEffect, useState } from "react";

export default function TabTwoScreen() {
    const [db, setDb] = useState<JobTrakrDB | null>(null);

    useEffect(() => {
        async function initDb() {
            console.info("Initializing DB...");
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

    const doCreateJobs = async () => {
        console.info("Creating jobs...");

        let newId = { value: 0n };
        const createStatus = await db?.GetJobDB().CreateJob(newId, {
            _id: 0n,
            Code: "Test Company",
            Name: "Test Location",
            JobTypeId: 1n,
            CustomerId: 1n,
            JobLocation: "9940 Blacksmith Way",
            StartDate: new Date(),
            PlannedFinish: new Date(),
            BidPrice: 1000.0,
            JobStatus: "Active",
        });

        console.info(`Created new job with id ${newId.value}. Status = ${createStatus}`);

        const updateStatus = await db?.GetJobDB().UpdateJob({
            _id: newId.value,
            Code: "Updated Test Company",
            Name: "Updated Test Location",
            JobTypeId: 11n,
            CustomerId: 11n,
            JobLocation: "Updated 9940 Blacksmith Way",
            StartDate: new Date(),
            PlannedFinish: new Date(),
            BidPrice: 2000.0,
            JobStatus: "Active",
        });

        console.info(`Updated job with id ${newId.value}. Status = ${updateStatus}`);
    };

    const doCreateCategories = async () => {
        console.info("Now query all the jobs:");
        const jobs: JobData[] = [];
        const queryStatus = await db?.GetJobDB().FetchAllJobs(jobs);
        for (const job of jobs) {
            console.info(`     Job: ${job._id} = ${job.Code} - ${job.Name}`);
            let newCatId = { value: 0n };
            const createStatus = await db?.GetCategoryDB().CreateCategory(newCatId, {
                _id: 0n,
                JobId: job._id,
                Code: "Test Cat",
                CategoryName: "Test Cat Name",
                EstPrice: 1000.0,
                CategoryStatus: "Active",
            });
            console.info(`Created new category with id ${newCatId.value}. Status = ${createStatus}`);
        }
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
                    <ThemedView>
                        <Button
                            title="Create Jobs"
                            onPress={doCreateJobs}
                        />
                        <Button
                            title="Create Categories"
                            onPress={doCreateCategories}
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
});
