#!/usr/bin/env node
// --- REST OF YOUR SCRIPT CODE FOLLOWS BELOW ---
const { execSync } = require('child_process');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// --- Setup Readline Interface ---
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Executes a shell command synchronously and handles errors.
 * @param {string} command The command string to execute.
 * @param {string} cwd The directory to execute the command in.
 */
function executeCommand(command, cwd = process.cwd()) {
    try {
        console.log(`\nExecuting: ${command} in ${cwd}`);
        // The stdio: 'inherit' option pipes command output to the console
        execSync(command, { stdio: 'inherit', cwd: cwd });
        return true;
    } catch (error) {
        console.error(`\n🚨 Command failed in ${cwd}: ${command}`);
        // console.error(error.message); // Uncomment for detailed error log
        return false;
    }
}

/**
 * 1 & 2: Prompts user for repository links and the absolute destination path.
 * @returns {Promise<{repoUrls: string[], absolutePath: string}>}
 */
function getUserInput() {
    return new Promise((resolve) => {
        rl.question("1. Enter the absolute path for the setup folder (e.g., /Users/User/Projects): ", (absolutePath) => {
            const resolvedPath = path.resolve(absolutePath.trim());

            // Check if the path exists, if not, try to create it
            if (!fs.existsSync(resolvedPath)) {
                console.log(`\nDirectory not found. Creating ${resolvedPath}...`);
                try {
                    fs.mkdirSync(resolvedPath, { recursive: true });
                } catch (e) {
                    console.error(`\n🚨 Error: Could not create directory at ${resolvedPath}. Please check permissions.`);
                    rl.close();
                    process.exit(1);
                }
            }

            rl.question("2. Enter the Git repository URLs (separate multiple links with a semicolon ';'): ", (urls) => {
                const repoUrls = urls.trim().split(';').map(url => url.trim()).filter(url => url.length > 0);

                if (repoUrls.length === 0) {
                    console.error("\n🚨 No repository URLs provided. Exiting.");
                    rl.close();
                    process.exit(1);
                }

                resolve({ repoUrls, absolutePath: resolvedPath });
            });
        });
    });
}

/**
 * 3: Asks user preference for dependency manager.
 * @returns {Promise<string>} 'npm' or 'yarn'
 */
function getPackageManagerPreference() {
    return new Promise((resolve) => {
        rl.question("3. Use 'npm' or 'yarn' to install dependencies? (Enter 'yarn' or 'npm'): ", (choice) => {
            const manager = choice.trim().toLowerCase();
            if (manager === 'yarn' || manager === 'npm') {
                resolve(manager);
            } else {
                console.log("Invalid choice. Defaulting to 'npm'.");
                resolve('npm');
            }
        });
    });
}

/**
 * 4: Checks for Yarn and installs it globally if not found.
 * @param {string} packageManager The user's preferred package manager.
 */
function checkAndInstallYarn(packageManager) {
    if (packageManager !== 'yarn') {
        return;
    }
    console.log("\n4. Checking for Yarn...");
    try {
        // Check if yarn command is available
        execSync('yarn --version', { stdio: 'pipe' });
        console.log("✅ Yarn found on the system.");
    } catch (e) {
        console.log("⚠️ Yarn not found. Installing globally using npm...");
        // Install yarn globally
        if (executeCommand('npm install -g yarn')) {
            console.log("✅ Yarn installed successfully.");
        } else {
            console.log("🚨 Failed to install Yarn. Please install it manually or switch to 'npm'.");
            process.exit(1);
        }
    }
}

/**
 * 5: Clones all repositories into the specified absolute path.
 * @param {string[]} repoUrls List of repository URLs.
 * @param {string} absolutePath The absolute directory path.
 * @returns {string[]} List of cloned folder names.
 */
function cloneRepositories(repoUrls, absolutePath) {
    console.log("\n5. Cloning Repositories...");
    const clonedFolders = [];

    for (const url of repoUrls) {
        // Extract the folder name from the URL
        const folderName = url.split('/').pop().replace('.git', '');
        const fullPath = path.join(absolutePath, folderName);

        console.log(`\nAttempting to clone ${url}...`);

        if (executeCommand(`git clone ${url} ${fullPath}`)) {
            clonedFolders.push(folderName);
        } else {
            console.error(`\n🚨 Failed to clone ${url}. Skipping to the next one.`);
        }
    }
    return clonedFolders;
}

/**
 * 6: Installs dependencies for each cloned repository.
 * @param {string[]} clonedFolders List of repository folder names.
 * @param {string} absolutePath The root directory where folders are located.
 * @param {string} packageManager The package manager to use ('npm' or 'yarn').
 */
function installDependencies(clonedFolders, absolutePath, packageManager) {
    console.log(`\n6. Installing dependencies using ${packageManager}...`);
    const installCommand = (packageManager === 'yarn') ? 'yarn install' : 'npm install';

    for (const folder of clonedFolders) {
        const repoPath = path.join(absolutePath, folder);

        // Check if package.json exists before trying to install
        if (fs.existsSync(path.join(repoPath, 'package.json'))) {
            console.log(`\n--- Installing dependencies for: ${folder} ---`);
            executeCommand(installCommand, repoPath);
        } else {
            console.log(`\n⚠️ Skipping dependency install for ${folder}. package.json not found.`);
        }
    }
}

/**
 * Main function to orchestrate the entire setup process.
 */
async function main() {
    console.log("================================================");
    console.log("      🚀 Multi-Project Setup Automation 🚀");
    console.log("================================================");

    try {
        // Step 1 & 2
        const { repoUrls, absolutePath } = await getUserInput();

        // Step 3
        const packageManager = await getPackageManagerPreference();
        rl.close(); // Close the readline interface after getting all necessary input

        // Step 4
        checkAndInstallYarn(packageManager);

        // Step 5
        const clonedFolders = cloneRepositories(repoUrls, absolutePath);

        if (clonedFolders.length === 0) {
            console.log("\n🚨 No repositories were successfully cloned. Setup incomplete.");
            return;
        }

        // Step 6
        installDependencies(clonedFolders, absolutePath, packageManager);

        // Step 7
        console.log("\n================================================");
        console.log("         🎉 Setup Complete! 🎉");
        console.log(`All ${clonedFolders.length} repositories are set up at: ${absolutePath}`);
        console.log("You have everything ready to go.");
        console.log("================================================");

    } catch (e) {
        console.error("\nAn unexpected error occurred during setup:", e.message);
        process.exit(1);
    }
}

main();