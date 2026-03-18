import "dotenv/config";
import crypto from "node:crypto";
import express from "express";
import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

const app = express();
const port = Number(process.env.PORT) || 3000;
const mongoUri = process.env.MONGODB_URI;
const configuredOrigins = (
  process.env.CLIENT_ORIGINS ||
  process.env.CLIENT_ORIGIN ||
  ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

let reconnectTimer = null;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

const sampleSchema = new mongoose.Schema(
  {
    recordId: {
      type: Number,
      required: true,
      min: 1,
    },
    referenceNumber: {
      type: String,
      required: true,
      trim: true,
    },
    submissionDate: {
      type: Date,
      required: true,
    },
    analysisType: {
      type: String,
      required: true,
      trim: true,
    },
    analysisCodes: {
      type: [String],
      default: [],
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    telephone: {
      type: String,
      default: "",
      trim: true,
    },
    sampleType: {
      type: String,
      required: true,
      trim: true,
    },
    sampleCount: {
      type: Number,
      required: true,
      min: 1,
    },
    requestedTests: {
      type: [String],
      default: [],
    },
    requestedTestsNotes: {
      type: String,
      default: "",
      trim: true,
    },
    sampleReceivedBy: {
      type: String,
      default: "",
      trim: true,
    },
    inchargeOfSamples: {
      type: String,
      default: "",
      trim: true,
    },
    analysisState: {
      type: String,
      default: "",
      trim: true,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    proformaInvoiceRef: {
      type: String,
      default: "",
      trim: true,
    },
    voucherNo: {
      type: String,
      default: "",
      trim: true,
    },
    feeWithoutVat: {
      type: Number,
      min: 0,
    },
    feeWithVat: {
      type: Number,
      min: 0,
    },
    advanceAmount: {
      type: Number,
      min: 0,
    },
    advanceReceiptNo: {
      type: String,
      default: "",
      trim: true,
    },
    totalReceiptNo: {
      type: String,
      default: "",
      trim: true,
    },
    taxInvoiceNo: {
      type: String,
      default: "",
      trim: true,
    },
    reportIssueDate: {
      type: Date,
    },
    issuingMethod: {
      type: String,
      default: "",
      trim: true,
    },
    issuedBy: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Sample = mongoose.model("Sample", sampleSchema);

const isOriginAllowed = (origin) => {
  if (!origin) {
    return true;
  }

  if (configuredOrigins.length === 0) {
    return true;
  }

  return configuredOrigins.includes(origin);
};

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const requireDatabase = (_req, res, next) => {
  if (!isDatabaseReady()) {
    res.status(503).json({
      message:
        "Database connection is unavailable right now. Please try again in a moment.",
    });
    return;
  }

  next();
};

const scheduleReconnect = () => {
  if (reconnectTimer) {
    return;
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectToDatabase();
  }, 10000);
};

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("disconnected", () => {
  console.error("MongoDB disconnected");
  scheduleReconnect();
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB error", error);
});

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (isOriginAllowed(requestOrigin)) {
    res.header("Access-Control-Allow-Origin", requestOrigin || "*");
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  }

  if (req.method === "OPTIONS") {
    if (isOriginAllowed(requestOrigin)) {
      return res.sendStatus(204);
    }

    return res.sendStatus(403);
  }

  next();
});

app.use(express.json());

const scryptAsync = (password, salt) =>
  new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt);

  return `${salt}:${derivedKey.toString("hex")}`;
};

const verifyPassword = async (password, storedHash) => {
  const [salt, key] = storedHash.split(":");

  if (!salt || !key) {
    return false;
  }

  const derivedKey = await scryptAsync(password, salt);

  return crypto.timingSafeEqual(Buffer.from(key, "hex"), derivedKey);
};

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
});

const sanitizeSample = (sample) => ({
  id: sample._id.toString(),
  recordId: sample.recordId,
  referenceNumber: sample.referenceNumber,
  submissionDate: sample.submissionDate,
  analysisType: sample.analysisType,
  analysisCodes: sample.analysisCodes,
  clientName: sample.clientName,
  address: sample.address,
  telephone: sample.telephone,
  sampleType: sample.sampleType,
  sampleCount: sample.sampleCount,
  requestedTests: sample.requestedTests,
  requestedTestsNotes: sample.requestedTestsNotes,
  sampleReceivedBy: sample.sampleReceivedBy,
  inchargeOfSamples: sample.inchargeOfSamples,
  analysisState: sample.analysisState,
  remarks: sample.remarks,
  proformaInvoiceRef: sample.proformaInvoiceRef,
  voucherNo: sample.voucherNo,
  feeWithoutVat: sample.feeWithoutVat,
  feeWithVat: sample.feeWithVat,
  advanceAmount: sample.advanceAmount,
  advanceReceiptNo: sample.advanceReceiptNo,
  totalReceiptNo: sample.totalReceiptNo,
  taxInvoiceNo: sample.taxInvoiceNo,
  reportIssueDate: sample.reportIssueDate,
  issuingMethod: sample.issuingMethod,
  issuedBy: sample.issuedBy,
  createdAt: sample.createdAt,
  updatedAt: sample.updatedAt,
});

const getTrimmedString = (value) =>
  typeof value === "string" ? value.trim() : "";

const getPositiveInteger = (value) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return null;
  }

  return parsedValue;
};

const getOptionalNonNegativeNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return Number.NaN;
  }

  return parsedValue;
};

const parseDateInput = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const ddmmyyyyMatch = trimmedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (ddmmyyyyMatch) {
    const [, dayText, monthText, yearText] = ddmmyyyyMatch;
    const day = Number(dayText);
    const month = Number(monthText);
    const year = Number(yearText);
    const dateValue = new Date(Date.UTC(year, month - 1, day));

    if (
      dateValue.getUTCFullYear() === year &&
      dateValue.getUTCMonth() === month - 1 &&
      dateValue.getUTCDate() === day
    ) {
      return dateValue;
    }

    return Number.NaN;
  }

  const fallbackDate = new Date(trimmedValue);
  return Number.isNaN(fallbackDate.getTime()) ? Number.NaN : fallbackDate;
};

const getDateValue = (value) => {
  if (!value) {
    return null;
  }

  const dateValue = parseDateInput(value);
  return Number.isNaN(dateValue) ? null : dateValue;
};

const getOptionalDateValue = (value) => {
  if (!value) {
    return undefined;
  }

  return parseDateInput(value);
};

const getStringArray = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => getTrimmedString(item))
        .filter(Boolean)
    : [];

const connectToDatabase = async () => {
  if (
    !mongoUri ||
    mongoose.connection.readyState === 1 ||
    mongoose.connection.readyState === 2
  ) {
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    console.error("MongoDB connection failed", error);
    scheduleReconnect();
  }
};

app.get("/", (_req, res) => {
  res.json({ message: "Lab request backend is running" });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: isDatabaseReady() ? "connected" : "disconnected",
  });
});

app.post("/api/auth/register", requireDatabase, async (req, res, next) => {
  try {
    const name = req.body?.name?.trim() || "";
    const email = req.body?.email?.trim().toLowerCase() || "";
    const password = req.body?.password || "";

    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: "Name, email, and password are required." });
      return;
    }

    if (password.length < 8) {
      res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
      return;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res
        .status(409)
        .json({ message: "An account with this email already exists." });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    res.status(201).json({
      message: "Registration successful. Please sign in.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", requireDatabase, async (req, res, next) => {
  try {
    const email = req.body?.email?.trim().toLowerCase() || "";
    const password = req.body?.password || "";

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);

    if (!passwordMatches) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    res.json({
      message: `Welcome back, ${user.name}.`,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/samples", requireDatabase, async (_req, res, next) => {
  try {
    const samples = await Sample.find()
      .sort({ submissionDate: -1, createdAt: -1 })
      .exec();

    res.json({
      samples: samples.map((sample) => sanitizeSample(sample)),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/samples", requireDatabase, async (req, res, next) => {
  try {
    const recordId = getPositiveInteger(req.body?.recordId);
    const referenceNumber = getTrimmedString(req.body?.referenceNumber);
    const submissionDate = getDateValue(req.body?.submissionDate);
    const analysisType = getTrimmedString(req.body?.analysisType);
    const clientName = getTrimmedString(req.body?.clientName);
    const sampleType = getTrimmedString(req.body?.sampleType);
    const sampleCount = getPositiveInteger(req.body?.sampleCount);
    const feeWithoutVat = getOptionalNonNegativeNumber(req.body?.feeWithoutVat);
    const feeWithVat = getOptionalNonNegativeNumber(req.body?.feeWithVat);
    const advanceAmount = getOptionalNonNegativeNumber(req.body?.advanceAmount);
    const reportIssueDate = getOptionalDateValue(req.body?.reportIssueDate);

    if (!recordId) {
      res
        .status(400)
        .json({ message: "Record ID must be a whole number greater than zero." });
      return;
    }

    if (!referenceNumber) {
      res.status(400).json({ message: "Reference number is required." });
      return;
    }

    if (!submissionDate) {
      res.status(400).json({ message: "Submission date is required." });
      return;
    }

    if (!analysisType) {
      res.status(400).json({ message: "Type of analysis is required." });
      return;
    }

    if (!clientName) {
      res.status(400).json({ message: "Client name is required." });
      return;
    }

    if (!sampleType) {
      res.status(400).json({ message: "Sample type is required." });
      return;
    }

    if (!sampleCount) {
      res.status(400).json({
        message: "Number of samples must be a whole number greater than zero.",
      });
      return;
    }

    if (
      Number.isNaN(feeWithoutVat) ||
      Number.isNaN(feeWithVat) ||
      Number.isNaN(advanceAmount)
    ) {
      res.status(400).json({
        message: "Fee and advance amounts must be valid non-negative numbers.",
      });
      return;
    }

    if (Number.isNaN(reportIssueDate)) {
      res.status(400).json({
        message: "Report issue date must be a valid date.",
      });
      return;
    }

    const existingSample = await Sample.findOne({ referenceNumber });

    if (existingSample) {
      res.status(409).json({
        message: "A sample with this reference number already exists.",
      });
      return;
    }

    const sample = await Sample.create({
      recordId,
      referenceNumber,
      submissionDate,
      analysisType,
      analysisCodes: getStringArray(req.body?.analysisCodes),
      clientName,
      address: getTrimmedString(req.body?.address),
      telephone: getTrimmedString(req.body?.telephone),
      sampleType,
      sampleCount,
      requestedTests: getStringArray(req.body?.requestedTests),
      requestedTestsNotes: getTrimmedString(req.body?.requestedTestsNotes),
      sampleReceivedBy: getTrimmedString(req.body?.sampleReceivedBy),
      inchargeOfSamples: getTrimmedString(req.body?.inchargeOfSamples),
      analysisState: getTrimmedString(req.body?.analysisState),
      remarks: getTrimmedString(req.body?.remarks),
      proformaInvoiceRef: getTrimmedString(req.body?.proformaInvoiceRef),
      voucherNo: getTrimmedString(req.body?.voucherNo),
      feeWithoutVat,
      feeWithVat,
      advanceAmount,
      advanceReceiptNo: getTrimmedString(req.body?.advanceReceiptNo),
      totalReceiptNo: getTrimmedString(req.body?.totalReceiptNo),
      taxInvoiceNo: getTrimmedString(req.body?.taxInvoiceNo),
      reportIssueDate,
      issuingMethod: getTrimmedString(req.body?.issuingMethod),
      issuedBy: getTrimmedString(req.body?.issuedBy),
    });

    res.status(201).json({
      message: `Sample ${sample.referenceNumber} saved successfully.`,
      sample: sanitizeSample(sample),
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  if (error?.code === 11000) {
    res
      .status(409)
      .json({ message: "An account with this email already exists." });
    return;
  }

  if (
    error?.name === "MongoServerSelectionError" ||
    error?.name === "MongooseError"
  ) {
    res.status(503).json({
      message:
        "Database connection is unavailable right now. Please try again in a moment.",
    });
    return;
  }

  console.error("Request failed", error);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

const startServer = () => {
  if (!mongoUri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    connectToDatabase();
  });
};

startServer();




