import * as vscode from 'vscode';
import { fetchAllTestCasesGraphQL } from './functions/testCaseFetcher';
import { testAllCases } from './functions/testRunner';

export function activate(context: vscode.ExtensionContext) {
    const fetchTestCasesCommand = vscode.commands.registerCommand('cph.fetchTestCases', async () => {
        const url = await vscode.window.showInputBox({
            prompt: 'Enter LeetCode Problem URL',
        });

        if (url) {
            const problemSlugMatch = url.match(/leetcode\.com\/problems\/([\w-]+)\//);
            if (problemSlugMatch) {
                const problemSlug = problemSlugMatch[1];
                await fetchAllTestCasesGraphQL(problemSlug);
            } else {
                vscode.window.showErrorMessage('Invalid LeetCode Problem URL');
            }
        }
    });

    const runTestCasesCommand = vscode.commands.registerCommand('cph.runTestCases', async () => {
        const scriptPath = await vscode.window.showInputBox({
            prompt: 'Enter the path to your script file to test against inputs',
        });

        if (scriptPath) {
            await testAllCases(scriptPath);
        } else {
            vscode.window.showErrorMessage('Invalid script file path.');
        }
    });

    context.subscriptions.push(fetchTestCasesCommand, runTestCasesCommand);
}

export function deactivate() {}