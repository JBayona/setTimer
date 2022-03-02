import moongose from "mongoose";

interface ITimer {
  url: string;
  hours: number;
  minutes: number;
  seconds: number;
  isTriggered: boolean;
}

interface TimerModelInterface extends moongose.Model<TimerDoc> {
  build(attr: ITimer): TimerDoc;
}

interface TimerDoc extends moongose.Document {
  id: string;
  url: string;
  hours: number;
  minutes: number;
  seconds: number;
  isTriggered: boolean;
  createdAt: number;
}

const timerSchema = new moongose.Schema({
  url: {
    type: String,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
  },
  minutes: {
    type: Number,
    required: true,
  },
  seconds: {
    type: Number,
    required: true,
  },
  isTriggered: {
    type: Boolean,
    required: false,
  },
});

timerSchema.statics.build = (attr: ITimer) => new Timer(attr);

const Timer = moongose.model<TimerDoc, TimerModelInterface>(
  "Timer",
  timerSchema
);

export { Timer };
