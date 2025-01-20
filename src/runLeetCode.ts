// runLeetCode.ts

import axios from 'axios';
import * as vscode from 'vscode';

export async function runCodeOnLeetCode(problemSlug: string, language: string, code: string): Promise<void> {
    try {
        const submissionEndpoint = `https://leetcode.com/problems/${problemSlug}/interpret_solution/`;

        const csrfToken = '9KpAR4xAmqnRksxczlJ6H8CMwstQl8joqFZ3qP7jUmucWOQ6n29X271zm7nkqgEG'; // Fetch your LeetCode CSRF token if required (browser network debugging tools can help)
        
        const headers = {
            'Content-Type': 'application/json',
            'x-csrftoken': csrfToken,
            'Cookie': `gr_user_id=8d98b907-412c-4696-acdb-0332a04433ca; 87b5a3c3f1a55520_gr_last_sent_cs1=papa_pawan; __gads=ID=174f4a3e180258bd:T=1721306995:RT=1722748520:S=ALNI_MaEJiugUotaHsGX2crWRU5mqKiKoA; __gpi=UID=00000e98c9646936:T=1721306995:RT=1722748520:S=ALNI_MbgVWj5Xt1IFPEBG6qlSV7z1m3IYg; __eoi=ID=3ff719cb45e2912e:T=1721306995:RT=1722748520:S=AA-AfjazQ0JcQXWQb0llEu5-m11t; FCNEC=%5B%5B%22AKsRol-qKcm5qENmNcdaWQfV9fOSB4gYjQiSsRn3JSZpYMKX7_gqCEi4mBR8bpGgTASjBMakCwaFIXSLtEG_bF1X_pDOW_AP5w4Ryp6gQnifyrltJ-fZX5kaDIdfGspQfpTwhldXcLXVXy8d5JcGpUK-pfc6cNlT7Q%3D%3D%22%5D%5D; _ga=GA1.1.1875788046.1721306946; 87b5a3c3f1a55520_gr_cs1=papa_pawan; _ga_CDRWKZTDEX=GS1.1.1722943843.4.0.1722943843.60.0.0; INGRESSCOOKIE=e763cabf6318a36debb0cd617f7bde50|8e0876c7c1464cc0ac96bc2edceabd27; ip_check=(false, "2409:40e3:4025:be56:fd94:f00c:5d4f:2124"); cf_clearance=cBobxhyTyT9OYgBhky.A3f1ajBqOrmhiRx5MiLw_cQM-1734959444-1.2.1.1-SNmQ2parriH9kqhRBCiCWPz3kr3.KP5wtgp55B.ShUxHmVGS6pVWkyYbihBRaa5hwAdigVY1.RZ2e8PN3tPVzU1lFPxSXQlQq0sCdEjwmKqkcYV5L1GCeYrV5QacNa8705AQAfoDhFIw3L871ldLkihMY.RD.KkdSX6R_6kaOB7fYdpTGpqWiO4mEr3BCXqpPTfJGpr3wCYUWfHZu02xIX1wHZYeTR9Wdna_3.g07_M174U2PDYssLC55LsjC6fkgFyfibsu3tsm14Y4nXIaEfmHzSNVfv3C5Eq74_ecSaQTmu6.r.RIUNkjD5oP3wWfoVg7_UVsFgdx3FlDRQI7Ssy25Fv2Xke5pdFjrlSID07qY_5BR6BX0BpDJIkZ6rf0mJBwcmSE_wF5_ITDUhzTBlCcU5S2yvkfEAxkKYV1IC1PllJYHuOerOqTmbBcqllA; csrftoken=9KpAR4xAmqnRksxczlJ6H8CMwstQl8joqFZ3qP7jUmucWOQ6n29X271zm7nkqgEG; messages=.eJyLjlaKj88qzs-Lz00tLk5MT1XSMdAxMtVRCi5NTgaKpJXm5FQqFGem56WmKGTmKSQWKxQkFiTGFySWJ-bpKcXqUKg_FgBkiizz:1tPiCs:syE9N9T82AEJQcZIuLbpsXJWzAPPsBEIcwHN5HIjzqE; LEETCODE_SESSION=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfYXV0aF91c2VyX2lkIjoiMTM0NjA5NDEiLCJfYXV0aF91c2VyX2JhY2tlbmQiOiJkamFuZ28uY29udHJpYi5hdXRoLmJhY2tlbmRzLk1vZGVsQmFja2VuZCIsIl9hdXRoX3VzZXJfaGFzaCI6Ijk1YjU1N2VlYzk4YjU5MDdhZWM1MzRmZDcwYWMxZGVlZTFjODM3ZWUzN2JiMDdiZTdmNGM0ZDMzZmI2NTU1OGUiLCJzZXNzaW9uX3V1aWQiOiI4ZTNhM2M5NSIsImlkIjoxMzQ2MDk0MSwiZW1haWwiOiJwYXBhcGF3YW4uMDFAZ21haWwuY29tIiwidXNlcm5hbWUiOiJwYXBhX3Bhd2FuIiwidXNlcl9zbHVnIjoicGFwYV9wYXdhbiIsImF2YXRhciI6Imh0dHBzOi8vYXNzZXRzLmxlZXRjb2RlLmNvbS91c2Vycy9kZWZhdWx0X2F2YXRhci5qcGciLCJyZWZyZXNoZWRfYXQiOjE3MzQ5NTk0NDYsImlwIjoiMjQwOTo0MGUzOjMwMGQ6Y2NmMjpmZDNiOmE1OTU6ZDkxYjpmZGQ3IiwiaWRlbnRpdHkiOiJmNTFiYjQ4MmM2NjBkMGVlYWRkMWYwNTgwNThhMmIzNSIsImRldmljZV93aXRoX2lwIjpbIjk5YjJhNTFlMzcwMWQ0MzliMGY2ZTVlY2NjNmIyNjdlIiwiMjQwOTo0MGUzOjMwMGQ6Y2NmMjpmZDNiOmE1OTU6ZDkxYjpmZGQ3Il0sIl9zZXNzaW9uX2V4cGlyeSI6MTIwOTYwMH0.4G68xRG_iP4ESerDwAwPmCoKhjqEl2308bkAGAex6Og; _dd_s=rum=0&expire=1734960347322;`,
        };

        const response = await axios.post(
            submissionEndpoint,
            {
                lang: language,
                typed_code: code,
                question_id: problemSlug,
            },
            { headers }
        );

        const resultId = response.data.interpret_id;
        const resultEndpoint = `https://leetcode.com/submissions/detail/${resultId}/check/`;

        // Polling for the result
        let result = null;
        for (let i = 0; i < 10; i++) {
            const resultResponse = await axios.get(resultEndpoint, { headers });
            if (resultResponse.data.state === 'SUCCESS') {
                result = resultResponse.data;
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
        }

        if (result) {
            vscode.window.showInformationMessage(`Output: ${result.code_output}`);
        } else {
            vscode.window.showErrorMessage('Failed to fetch the result from LeetCode.');
        }
    } catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`Error running code on LeetCode: ${error.message}`);
        } else {
            vscode.window.showErrorMessage('An unknown error occurred while running code on LeetCode.');
        }
    }
    
}
