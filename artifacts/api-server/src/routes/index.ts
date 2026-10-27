import { Router, type IRouter } from "express";
import healthRouter from "./health";
import pantryRouter from "./pantry";

const router: IRouter = Router();

router.use(healthRouter);
router.use(pantryRouter);

export default router;
