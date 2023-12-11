export type GestureRef = {
  gestureId: string;
  mediaRef: string;
};
export type gestureMedia = {
  id: string;
  type: string;
  gestureRef: string;
  mediaRef: string;
};

export type Gesture = {
  id: string;
  phrase: string;
  topicId: string;
  media: gestureMedia[];
};
