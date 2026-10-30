import express from "express";
import { authmiddleware, requireRole } from "../middleware/AuthMiddleware.js";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  createStudentsBulk,
  updateStudent,
  deleteStudent,
} from "../controller/StudentController.js";

const router = express.Router();

router.use("/students", authmiddleware, requireRole("ADMIN"));

// Get all students
router.get("/students", getAllStudents);
// Get single student by ID
router.get("/students/:id", getStudentById);
// Create multiple students, skipping existing student codes
router.post("/students/bulk", createStudentsBulk);
// Create new student
router.post("/students", createStudent);
// Update student by ID
router.put("/students/:id", updateStudent);
// Delete student by ID
router.delete("/students/:id", deleteStudent);
export default router;
