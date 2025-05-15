export interface MessagePayload {
  value: {
    submissionId: string;
    repositoryUrl: string;
  };
}

export interface CorrectLessonResponse {
  grade: number;
  status: string;
}
