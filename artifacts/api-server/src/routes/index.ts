import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dnaRouter from "./dna";
import dropsRouter from "./drops";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dnaRouter);
router.use(dropsRouter);

export default router;
