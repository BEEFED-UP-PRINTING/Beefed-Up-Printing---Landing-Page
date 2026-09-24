import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dnaRouter from "./dna";
import dropsRouter from "./drops";
import maggieRouter from "./maggie";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dnaRouter);
router.use(dropsRouter);
router.use(maggieRouter);

export default router;
