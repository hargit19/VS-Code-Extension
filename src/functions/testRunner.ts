import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { runUserCode, compareOutputs } from './codeRunner';

export async function testAllCases(scriptPath: string): Promise<void> {
    try {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('Please open a workspace to run test cases.');
            return;
        }
        const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;

        const inputFiles = fs.readdirSync(workspacePath)
            .filter(file => file.startsWith('input_') && file.endsWith('.txt'));
        const outputFiles = fs.readdirSync(workspacePath)
            .filter(file => file.startsWith('output_') && file.endsWith('.txt'));

        if (inputFiles.length !== outputFiles.length) {
            vscode.window.showErrorMessage('Mismatch between the number of input and output files.');
            return;
        }

        for (let i = 0; i < inputFiles.length; i++) {
            const inputFilePath = path.join(workspacePath, inputFiles[i]);
            const outputFilePath = path.join(workspacePath, outputFiles[i]);

            const input = fs.readFileSync(inputFilePath, 'utf8').trim();
            const expectedOutput = fs.readFileSync(outputFilePath, 'utf8').trim();

            try {
                const generatedOutput = await runUserCode(input, scriptPath);

                if (compareOutputs(generatedOutput, expectedOutput)) {
                    vscode.window.showInformationMessage(`Test case ${i + 1}: Passed`);
                } else {
                    vscode.window.showErrorMessage(
                        `Test case ${i + 1}: Failed\nExpected: ${expectedOutput}\nGenerated: ${generatedOutput}`
                    );
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error executing test case ${i + 1}: ${error}`);
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`Error running test cases: ${error.message}`);
        } else {
            vscode.window.showErrorMessage('An unknown error occurred while running test cases.');
        }
    }
}