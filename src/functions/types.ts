export interface TestCase {
    input: string;
    output: string;
}

export interface QuestionData {
    content: string;
}

export interface GraphQLResponse {
    data: {
        question: QuestionData;
    };
}