import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

export async function runUserCode(input: string, scriptPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const binaryPath = path.join(path.dirname(scriptPath), 'a.out');
        const outputFilePath = path.join(path.dirname(scriptPath), 'output.txt');
        const inputFilePath = path.join(path.dirname(scriptPath), 'input_temp.txt');

        fs.writeFileSync(inputFilePath, input, 'utf8');

        exec(`g++ "${scriptPath}" -o "${binaryPath}"`, (compileError, compileStdout, compileStderr) => {
            if (compileError) {
                reject(`Compilation failed: ${compileStderr}`);
                return;
            }

            const command = process.platform === 'win32'
                ? `"${binaryPath}" < "${inputFilePath}" > "${outputFilePath}"`
                : `"${binaryPath}" < "${inputFilePath}" > "${outputFilePath}"`;

            exec(command, (execError, stdout, stderr) => {
                if (execError) {
                    reject(`Execution failed: ${stderr || execError.message}`);
                } else {
                    fs.readFile(outputFilePath, 'utf8', (readError, data) => {
                        if (readError) {
                            reject(`Failed to read output file: ${readError.message}`);
                        } else {
                            resolve(data.trim());
                        }
                    });
                }
            });
        });
    });
}

export function compareOutputs(generated: string, expected: string): boolean {
    return generated === expected;
}