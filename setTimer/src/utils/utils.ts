import { add, millisecondsToSeconds } from 'date-fns';
import { Timer } from "../models/timer";
import axios from 'axios';

const getScheduledDate = (timer: any) => {
  return add(new Date(timer.createdAt), {
    hours: timer.hours,
    minutes: timer.minutes,
    seconds: timer.seconds,
  });
}

export function getSecondsLeft(timer: any) {
  const triggerWebhookTimeMS = getScheduledDate(timer).getTime();
  const secondsLeft = millisecondsToSeconds(triggerWebhookTimeMS - new Date().getTime());
  const secondsResponse = secondsLeft > 0 ? secondsLeft : 0;
  return secondsResponse;
}

export function getWebhookScheduledTime(timer: any) {
  const scheduledDate = getScheduledDate(timer);
  return scheduledDate;
}

export async function checkMissingWebhooks() {
  const jobs = await Timer.find({});
  for(let job of jobs) {
    const secondsLeft = getSecondsLeft(job);
    // This job should has been triggered but the server possible
    // went down, so we need to trigger them
    if(!secondsLeft && !job.isTriggered) {
      const response = await axios.post(job.url, {});
      console.log(response);
    }
  } 
}