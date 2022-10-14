import fs from "fs";
import path from "path";

const syncServerDist = (sourcePath: string, sourceDestination: string) => {
    const srcExists = fs.existsSync(sourcePath);
    if (!srcExists) {
        throw new Error("File source doesn't exist.");
    }

    const isDirectory = fs.statSync(sourcePath).isDirectory();
    if (isDirectory) {
        const destExists = fs.existsSync(sourceDestination);
        if (!destExists) {
            fs.mkdirSync(sourceDestination);
        }

        fs.readdirSync(sourcePath).forEach(function (childItemName) {
            syncServerDist(
                path.join(sourcePath, childItemName),
                path.join(sourceDestination, childItemName)
            );
        });
    } else {
        console.log(`Copying file: ${sourcePath} -> ${sourceDestination}`);
        fs.copyFileSync(sourcePath, sourceDestination);
    }
};

const fileSync = [
    {
        source: "./server/resources/audio",
        destination: "./dist/resources/audio",
    },
];

fileSync.forEach(({ source, destination }) =>
    syncServerDist(source, destination)
);

fs.rename("./build", "./dist/app", (e) => {
    if (e) {
        console.log(e);
    }
});
