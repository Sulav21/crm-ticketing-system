import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getAllTickets,
  getTicketByFilter,
  insertTicket,
} from "../models/tickets/ticket.model.js";

const router = express.Router();

router.all("/", (req, res, next) => {
  next();
});

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { subject, sender, message } = req.body;
    const ticketObj = {
      // req.userInfo._id is coming from authmiddleware where we are returning the userinfo
      clientId: req.userInfo._id,
      subject,
      conversations: [{ sender, message }],
    };
    const result = await insertTicket(ticketObj);
    if (result?._id) {
      return res.json({
        status: "success",
        message: "Ticket has been successfully created",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Unable to create ticket, please try again later",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:_id?", authMiddleware, async (req, res, next) => {
  try {
    const { _id } = req.params;
    const clientId = req.userInfo;
   
    const result = _id
      ? await getTicketByFilter({ _id })
      : await getAllTickets({ clientId });
    if (result) {
      return res.json({
        status: "success",
        result,
      });
    }

    res.status(403).json({
      status: "error",
      message: "Couldn't find any tickets related to the user",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
