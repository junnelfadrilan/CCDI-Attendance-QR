import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface Student {
  studentId: string;
  name: string;
  course: string;
  section: string;
  team: string;
  yearLevel: string;
}

interface Attendance {
  id: number;
  student: Student;
  loggedAt: string;
}

// =====================================================
// SAMPLE STUDENT DATA
// =====================================================

const students: Student[] = [
  {
    studentId: "STU-1002",
    name: "Juan Dela Cruz",
    course: "BS Information Systems",
    section: "BSIS 3A",
    team: "Yellow Team",
    yearLevel: "3rd Year",
  },
  {
    studentId: "STU-1003",
    name: "Maria Santos",
    course: "BS Information Systems",
    section: "BSIS 3A",
    team: "Red Team",
    yearLevel: "3rd Year",
  },
  {
    studentId: "STU-1004",
    name: "Pedro Reyes",
    course: "BS Information Systems",
    section: "BSIS 3B",
    team: "Blue Team",
    yearLevel: "3rd Year",
  },
  {
    studentId: "STU-1005",
    name: "Ana Garcia",
    course: "BS Information Systems",
    section: "BSIS 4A",
    team: "Green Team",
    yearLevel: "4th Year",
  },
  {
    studentId: "STU-1006",
    name: "Carlos Mendoza",
    course: "BS Information Systems",
    section: "BSIS 4A",
    team: "Yellow Team",
    yearLevel: "4th Year",
  },
];

function ScannerArea() {
  const [scanResult, setScanResult] = useState("");
  const [scannerActive, setScannerActive] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [message, setMessage] = useState("Waiting for scan...");

  const [messageType, setMessageType] = useState<
    "waiting" | "success" | "error"
  >("waiting");

  const [attendance, setAttendance] = useState<Attendance[]>([]);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  // =====================================================
  // FIND STUDENT
  // =====================================================

  const findStudent = (qrCode: string) => {
    return students.find((student) => student.studentId === qrCode);
  };

  // =====================================================
  // PROCESS QR CODE
  // =====================================================

  const handleQRCode = async (qrCode: string) => {
    const code = qrCode.trim();

    if (!code) {
      return;
    }

    setScanResult(code);

    // Find student
    const student = findStudent(code);

    if (!student) {
      setSelectedStudent(null);
      alert("Student not found.");
      setMessage("Student not found.");
      setMessageType("error");

      return;
    }

    // Check duplicate attendance
    const alreadyRecorded = attendance.some(
      (record) => record.student.studentId === student.studentId,
    );

    if (alreadyRecorded) {
      setSelectedStudent(student);
      setMessage("Attendance already recorded for this student.");

      setMessageType("error");

      return;
    }

    // Record attendance
    const newAttendance: Attendance = {
      id: Date.now(),
      student: student,
      loggedAt: new Date().toLocaleTimeString(),
    };

    setAttendance((previous) => [newAttendance, ...previous]);
    setSelectedStudent(student);

    setMessage("Attendance recorded successfully!");

    setMessageType("success");

    // Stop camera after successful scan
    await stopScanner();

    // Automatically restart scanner
    setTimeout(() => {
      startScanner();
    }, 2000);
  };

  // =====================================================
  // START CAMERA
  // =====================================================

  const startScanner = async () => {
    try {
      if (scannerRef.current) {
        return;
      }
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
    } catch (error) {
      console.error(error);

      setScannerActive(false);

      scannerRef.current = null;

      setMessage("Unable to access camera. Please allow camera permission.");

      setMessageType("error");
    }
  };

  // =====================================================
  // STOP CAMERA
  // =====================================================

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();

        scannerRef.current.clear();

        scannerRef.current = null;
      }

      setScannerActive(false);
    } catch (error) {
      console.error("Scanner stop error:", error);
    }
  };

  // =====================================================
  // USB / BLUETOOTH QR SCANNER
  // =====================================================

  const handleScannerKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (!scanResult.trim()) {
        return;
      }

      handleQRCode(scanResult);

      setScanResult("");
    }
  };

  // =====================================================
  // CLEANUP
  // =====================================================

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 2. Conditional re-focusing logic
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // e.relatedTarget is the element that is receiving the new focus
    const nextFocusedElement = e.relatedTarget as HTMLElement;

    // Check if the user clicked another input, textarea, or select dropdown
    const isTargetingAnotherInput =
      nextFocusedElement &&
      (["INPUT"].includes(nextFocusedElement.tagName) ||
        nextFocusedElement.isContentEditable);

    if (!isTargetingAnotherInput) {
      // If they clicked the background or text, steal focus back
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* =================================================
          LEFT SIDE
      ================================================= */}

      <div className="flex w-full flex-1 flex-col p-6 lg:w-1/2 lg:p-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            Recent Attendance
          </h1>

          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                    Student
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                    Team
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                    Logged At
                  </th>
                </tr>
              </thead>

              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-6 text-center text-sm text-gray-400"
                    >
                      No attendance recorded yet today.
                    </td>
                  </tr>
                ) : (
                  attendance.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-800">
                          {record.student.name}
                        </div>

                        <div className="text-xs text-gray-400">
                          {record.student.studentId}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {record.student.team}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {record.loggedAt}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div className="relative flex w-full flex-col items-center justify-center bg-blue-950 p-6 lg:w-1/2 lg:p-10">
        {/* Header */}

        <div className="mb-6 flex w-full max-w-md items-center justify-between">
          <span className="font-semibold text-white">Station 3</span>

          <span className="text-sm text-white/60">
            {new Date().toLocaleTimeString()}
          </span>
        </div>

        {/* Scanner Card */}

        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-center text-lg font-semibold text-gray-800">
            Attendance Scanner
          </h2>

          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-theme-lg">
            <input
              type="text"
              id="scan-input"
              autoComplete="off"
              autoFocus
              ref={inputRef}
              placeholder="Scan QR code..."
              onBlur={handleBlur}
              value={scanResult}
              onChange={(event) => setScanResult(event.target.value)}
              onKeyDown={handleScannerKeyDown}
              className="h-12 w-full rounded-lg border border-gray-300 px-4 text-center text-lg text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-none"
            />
          </div>

          {/* Camera */}

          <div
            id="qr-reader"
            className="overflow-hidden rounded-xl border border-gray-200"
          />

          {/* =================================================
              SCAN RESULT
          ================================================= */}

          <div
            className={`mt-5 min-h-[260px] rounded-2xl border p-6 ${
              messageType === "success"
                ? "border-green-200 bg-green-50"
                : messageType === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-gray-200 bg-orange-50"
            }`}
          >
            {!selectedStudent ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                <div className="mb-4 text-5xl">📷</div>

                <p className="font-medium text-gray-600">{message}</p>

                <p className="mt-2 text-sm text-gray-400">
                  Scan a student's QR code
                </p>
              </div>
            ) : (
              <div>
                {/* Success Icon */}

                <div className="mb-4 text-center text-5xl">
                  {messageType === "success" ? "✅" : "⚠️"}
                </div>

                {/* Status */}

                <div
                  className={`mb-5 rounded-lg px-4 py-2 text-center text-sm font-semibold ${
                    messageType === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {message}
                </div>

                {/* Student Information */}

                <div className="space-y-3">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {selectedStudent.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      {selectedStudent.studentId}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs text-gray-400">Course</p>

                      <p className="text-sm font-medium text-gray-700">
                        {selectedStudent.course}
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs text-gray-400">Section</p>

                      <p className="text-sm font-medium text-gray-700">
                        {selectedStudent.section}
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs text-gray-400">Year Level</p>

                      <p className="text-sm font-medium text-gray-700">
                        {selectedStudent.yearLevel}
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs text-gray-400">Team</p>

                      <p className="text-sm font-medium text-gray-700">
                        {selectedStudent.team}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              USB QR SCANNER
          ================================================= */}

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              USB / Bluetooth QR Scanner
            </label>

            <input
              type="text"
              value={scanResult}
              onChange={(event) => setScanResult(event.target.value)}
              onKeyDown={handleScannerKeyDown}
              autoComplete="off"
              placeholder="Scan QR code..."
              className="h-11 w-full rounded-lg border border-gray-300 px-4 text-center text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* =================================================
              TEST DATA
          ================================================= */}

          <div className="mt-5 rounded-lg bg-gray-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
              Sample QR Values
            </p>

            <div className="flex flex-wrap gap-2">
              {students.map((student) => (
                <p>{student.studentId}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScannerArea;
