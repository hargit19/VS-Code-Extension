import * as vscode from 'vscode';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { GraphQLResponse, TestCase } from './types';
import { extractTestCases } from './testCaseExtractor';

export async function fetchAllTestCasesGraphQL(problemSlug: string): Promise<void> {
    try {
        const graphqlEndpoint = 'https://leetcode.com/graphql';
        const query = `
            query getProblemData($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                    content
                }
            }
        `;
        
        const response = await axios.post<GraphQLResponse>(graphqlEndpoint, {
            query,
            variables: { titleSlug: problemSlug },
        });

        const questionData = response.data.data.question;
        if (questionData && questionData.content) {
            await saveTestCases(extractTestCases(questionData.content));
        } else {
            vscode.window.showErrorMessage('No problem content found for the given problem.');
        }
    } catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`Error fetching test cases: ${error.message}`);
        } else {
            vscode.window.showErrorMessage('An unknown error occurred while fetching test cases.');
        }
    }
}

async function saveTestCases(testCases: TestCase[]): Promise<void> {
    if (testCases.length === 0) {
        vscode.window.showErrorMessage('No valid test cases found in the problem content.');
        return;
    }

    if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage('Please open a workspace to save test cases.');
        return;
    }

    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;

    testCases.forEach(({ input, output }, index) => {
        const inputFilePath = path.join(workspacePath, `input_${index + 1}.txt`);
        const outputFilePath = path.join(workspacePath, `output_${index + 1}.txt`);

        fs.writeFileSync(inputFilePath, input, 'utf8');
        fs.writeFileSync(outputFilePath, output, 'utf8');

        vscode.window.showInformationMessage(
            `Test case ${index + 1} saved to ${inputFilePath} and ${outputFilePath}`
        );
    });
}