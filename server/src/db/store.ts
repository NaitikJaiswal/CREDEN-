import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { 
  IInstitution, 
  IUser, 
  IStudentIdentity, 
  IEnrolment, 
  IApprovedIntake, 
  IImportBatch, 
  IValidationIssue, 
  IVerificationRequest, 
  IAuditLog 
} from '../types/index.js';

class MemoryDatabase {
  institutions: IInstitution[] = [];
  users: IUser[] = [];
  studentIdentities: IStudentIdentity[] = [];
  enrolments: IEnrolment[] = [];
  approvedIntakes: IApprovedIntake[] = [];
  importBatches: IImportBatch[] = [];
  validationIssues: IValidationIssue[] = [];
  verificationRequests: IVerificationRequest[] = [];
  auditLogs: IAuditLog[] = [];
  isUsingMemory: boolean = true; // Default to true unless Mongoose explicitly connects
  isSeeded: boolean = false;

  async init() {
    try {
      mongoose.set('strictQuery', false);
      mongoose.set('bufferCommands', false); // Never block requests if MongoDB isn't running
      const connPromise = mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 1000,
      });
      await connPromise;
      console.log('✅ Connected to MongoDB via Mongoose');
      this.isUsingMemory = false;
    } catch (err) {
      console.warn('⚠️ MongoDB connection unavailable. Active engine: In-Memory Resilient Engine (zero-setup demo mode).');
      this.isUsingMemory = true;
    }
  }

  get isConnected(): boolean {
    return mongoose.connection.readyState === 1 && !this.isUsingMemory;
  }

  find<T>(collection: T[], predicate?: (item: T) => boolean): T[] {
    if (!predicate) return [...collection];
    return collection.filter(predicate);
  }

  findById<T extends { id: string }>(collection: T[], id: string): T | undefined {
    return collection.find((item) => item.id === id);
  }

  insert<T extends { id: string }>(collection: T[], item: T): T {
    collection.push(item);
    return item;
  }

  update<T extends { id: string }>(collection: T[], id: string, updates: Partial<T>): T | undefined {
    const idx = collection.findIndex((item) => item.id === id);
    if (idx === -1) return undefined;
    collection[idx] = { ...collection[idx], ...updates, updatedAt: new Date() } as T;
    return collection[idx];
  }

  delete<T extends { id: string }>(collection: T[], id: string): boolean {
    const idx = collection.findIndex((item) => item.id === id);
    if (idx === -1) return false;
    collection.splice(idx, 1);
    return true;
  }

  clear() {
    this.institutions = [];
    this.users = [];
    this.studentIdentities = [];
    this.enrolments = [];
    this.approvedIntakes = [];
    this.importBatches = [];
    this.validationIssues = [];
    this.verificationRequests = [];
    this.auditLogs = [];
    this.isSeeded = false;
  }
}

export const dbStore = new MemoryDatabase();
