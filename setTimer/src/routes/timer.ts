import express, { Request, Response } from "express";
import { Timer } from "../models/timer";
import { setKey, getKey } from "../redis/redis";
import { getSecondsLeft, getWebhookScheduledTime } from "../utils/utils";
import axios from "axios";

const router = express.Router();
const schedule = require("node-schedule");

// Get the status of a timer
router.get("/timers", [], async (req: Request, res: Response) => {
  const jobs = await Timer.find({});
  return res.status(200).send(jobs);
});

router.get("/timers/:id", [], async (req: Request, res: Response) => {
  const { id } = req.params;

  // Search for the information in the cache
  let cacheData;
  try {
    const value = await getKey(id);
    if (value) {
      cacheData = JSON.parse(value);
      let secondsLeft = getSecondsLeft(cacheData);
      return res.status(200).send({ id, time_left: secondsLeft });
    }
  } catch (err) {
    console.log("Error in Redis:", err);
  }
  // If not found in the cache, search in the DB and add it into
  // the cache
  const timer = await Timer.findById(id);

  // Nothing has been found
  if (!timer) {
    return res.status(200).send({});
  }
  const timerData = {
    createdAt: timer._id.getTimestamp(),
    url: timer.url,
    hours: timer.hours,
    minutes: timer.minutes,
    seconds: timer.seconds,
  };
  setKey(id, JSON.stringify(timerData));
  let secondsLeft = getSecondsLeft(timerData);
  return res.status(200).send({ id, time_left: secondsLeft });
});

// Remove everything
router.delete("/timers", async (req: Request, res: Response) => {
  const timer = await Timer.remove({});
  return res.status(200).send("Removed");
});

router.post("/timers", async (req: Request, res: Response) => {
  const { url, hours, minutes, seconds } = req.body;

  // We can check as well against the key in the body
  if (
    url === undefined ||
    hours === undefined ||
    minutes === undefined ||
    seconds === undefined
  ) {
    return res
      .status(400)
      .send({ error: "Bad request: Some required arguments might be missing" });
  }

  const timer = Timer.build({
    url,
    hours,
    minutes,
    seconds,
    isTriggered: false,
  });
  try {
    const { _id, url, hours, minutes, seconds, isTriggered } =
      await timer.save();
    const obj = {
      createdAt: _id.getTimestamp(),
      url,
      hours,
      minutes,
      seconds,
    };
    setKey(_id, JSON.stringify(obj));

    // Schedule job based on the hour/minute/second
    const scheduledDate = getWebhookScheduledTime(obj);
    const job = schedule.scheduleJob(scheduledDate, async function () {
      const URL = `${url}/${_id}`;
      console.log(`Executing webhook to call ${URL}`);
      const response = await axios.post(`${URL}`, {});
      console.log(response);
      // Update trigger field
      await Timer.updateOne({_id}, {isTriggered: true});
    });
    return res.status(201).send({ id: _id });
  } catch (error) {
    return res.status(400);
  }
});

export { router as timerRouter };
