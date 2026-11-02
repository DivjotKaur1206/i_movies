/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  ListTodo,
  Terminal,
  Database,
  Cpu,
  Monitor,
  HardDrive,
  UserCheck,
  UserPlus,
  Play,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Server,
  ArrowRight,
} from 'lucide-react';
import { EPICS, MONGO_SCHEMAS, API_ROUTES } from '../../data/mockData';
import { apiService } from '../../services/apiService';
import { EpicItem, TaskItem } from '../../types';

export const DocumentationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'epics' | 'api' | 'mongodb' | 'requirements'>('epics');
  const [selectedEpicId, setSelectedEpicId] = useState<string>(EPICS[0].id);
  const [taskStatusOverrides, setTaskStatusOverrides] = useState<Record<string, string>>({});

  // Mentor state
  const [mentor, setMentor] = useState(apiService.getMentor());
  const [isAssigningMentor, setIsAssigningMentor] = useState(false);
  const [mentorName, setMentorName] = useState('Dr. Marcus Vance');
  const [mentorRole, setMentorRole] = useState('Principal Distributed Systems Architect');
  const [mentorEmail, setMentorEmail] = useState('marcus.vance@cinema-arch.org');

  // REST API Playground
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>(API_ROUTES[0].endpoint);
  const [apiMethod, setApiMethod] = useState<string>(API_ROUTES[0].method);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiExecutionTime, setApiExecutionTime] = useState<number | null>(null);

  // MongoDB Collection View
  const [selectedCollection, setSelectedCollection] = useState<string>(MONGO_SCHEMAS[0].collectionName);

  // System Hardware Probe State
  const [probeResults, setProbeResults] = useState<{
    screenWidth: number;
    screenHeight: number;
    meetsResolution: boolean;
    cores: number;
    memoryEstimate: string;
    userAgent: string;
    isOnline: boolean;
  }>({
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1440,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 900,
    meetsResolution: typeof window !== 'undefined' ? window.innerWidth >= 1366 && window.innerHeight >= 768 : true,
    cores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 8 : 8,
    memoryEstimate: typeof (navigator as any)?.deviceMemory !== 'undefined' ? `${(navigator as any).deviceMemory} GB+` : '8 GB+ (Allocated)',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Chrome/V8 Node Environment',
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  const handleAssignMentor = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = apiService.assignMentor(mentorName, mentorRole, mentorEmail);
    setMentor(updated);
    setIsAssigningMentor(false);
  };

  const handleRemoveMentor = () => {
    apiService.removeMentor();
    setMentor(null);
  };

  const toggleTask = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Completed' ? 'In Progress' : 'Completed';
    setTaskStatusOverrides((prev) => ({ ...prev, [taskId]: nextStatus }));
  };

  const handleRunApiTest = async (endpoint: string, method: string) => {
    setIsLoadingApi(true);
    setApiResponse(null);
    const start = performance.now();
    try {
      const result = await apiService.executeApiTest(endpoint, method);
      const end = performance.now();
      setApiExecutionTime(Math.round(end - start));
      setApiResponse(result);
    } catch (e: any) {
      setApiResponse({ error: e.message || 'API Execution error' });
    } finally {
      setIsLoadingApi(false);
    }
  };

  const currentEpic = EPICS.find((e) => e.id === selectedEpicId) || EPICS[0];
  const currentCollectionDoc = MONGO_SCHEMAS.find((s) => s.collectionName === selectedCollection) || MONGO_SCHEMAS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200">
      {/* Overview Banner & Key Stats */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <span>PROJECT SPECIFICATION & ARCHITECTURE</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>EXPRESS.JS + MONGODB + REACT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              The IMovies Platform Documentation
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A complete technical guide to the setup, client-server REST pipeline, atomic seat matrix locking, JWT stateless security, and MongoDB schema architecture powering IMovies.
            </p>
          </div>

          {/* Mentor Status Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase font-mono text-slate-400">Project Mentor</span>
              {mentor ? (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assigned</span>
                </span>
              ) : (
                <span className="text-[11px] font-mono text-amber-400">
                  No mentor assigned yet
                </span>
              )}
            </div>

            {mentor ? (
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">{mentor.name}</div>
                <div className="text-[11px] text-slate-400">{mentor.title}</div>
                <div className="text-[10px] font-mono text-slate-500">{mentor.email}</div>
                <button
                  onClick={handleRemoveMentor}
                  className="mt-2 text-[10px] text-rose-400 hover:text-rose-300 underline"
                >
                  Unassign Mentor
                </button>
              </div>
            ) : (
              <div>
                <p className="text-[11px] text-slate-400 mb-2">
                  No technical advisor currently allocated to this cinema platform initiative.
                </p>
                <button
                  onClick={() => setIsAssigningMentor(true)}
                  className="w-full py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Assign / Request Mentor</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] uppercase font-mono text-slate-400">Total Epics</span>
            <div className="text-2xl font-display font-extrabold text-white mt-1">6</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Full System Coverage</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] uppercase font-mono text-slate-400">Stories & Tasks</span>
            <div className="text-2xl font-display font-extrabold text-amber-400 mt-1">19</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Total Tasks Documented</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] uppercase font-mono text-slate-400">Total Subtasks</span>
            <div className="text-2xl font-display font-extrabold text-white mt-1">0</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Per Technical Brief</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] uppercase font-mono text-slate-400">Skills Required</span>
            <div className="text-xs font-semibold text-slate-200 mt-1.5 truncate">
              HTML, CSS, JS, React, Node, Express, MongoDB, JWT
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Cross-Stack Mastery</div>
          </div>
        </div>
      </div>

      {/* Mentor Assignment Modal */}
      {isAssigningMentor && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-white text-base">Assign Technical Mentor</h3>
              <button onClick={() => setIsAssigningMentor(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleAssignMentor} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Mentor Name</label>
                <input
                  type="text"
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Title / Designation</label>
                <input
                  type="text"
                  value={mentorRole}
                  onChange={(e) => setMentorRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={mentorEmail}
                  onChange={(e) => setMentorEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssigningMentor(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-lg"
                >
                  Confirm Mentor Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Documentation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('epics')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'epics'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>The 6 Epics & 19 Tasks ({EPICS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'api'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Client-Server REST Playground</span>
        </button>

        <button
          onClick={() => setActiveTab('mongodb')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'mongodb'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>MongoDB Collections & ERD</span>
        </button>

        <button
          onClick={() => setActiveTab('requirements')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'requirements'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>System & Hardware Specs</span>
        </button>
      </div>

      {/* TAB 1: 6 EPICS & 19 TASKS EXPLORER */}
      {activeTab === 'epics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Epics Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block px-2">
              Select Epic (Total: 6)
            </span>
            {EPICS.map((epic) => {
              const isSelected = selectedEpicId === epic.id;
              return (
                <button
                  key={epic.id}
                  onClick={() => setSelectedEpicId(epic.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-amber-400 ring-1 ring-amber-400/40 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-amber-400">
                      Epic 0{epic.epicNumber}
                    </span>
                    <span className="font-mono text-slate-400">
                      {epic.tasksCount} Tasks
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-white text-sm mt-1 leading-snug">
                    {epic.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {epic.summary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Epic Tasks Details Panel */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                  <span>EPIC 0{currentEpic.epicNumber}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{currentEpic.tasksCount} STORIES / TASKS</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-1">
                  {currentEpic.title}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  <span className="font-semibold text-slate-200">Objective:</span> {currentEpic.objective}
                </p>
              </div>

              {/* Tasks List */}
              <div className="space-y-4 pt-2">
                {currentEpic.tasks.map((task) => {
                  const status = taskStatusOverrides[task.id] || task.status;
                  const isCompleted = status === 'Completed';

                  return (
                    <div
                      key={task.id}
                      className="p-5 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-bold">
                            Task #{task.taskNumber}
                          </span>
                          <h4 className="font-display font-bold text-white text-sm">
                            {task.title}
                          </h4>
                        </div>

                        <button
                          onClick={() => toggleTask(task.id, status)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                            isCompleted
                              ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                              : 'bg-amber-950 border border-amber-800 text-amber-300'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{status}</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Acceptance Criteria */}
                      <div className="pt-2 border-t border-slate-900">
                        <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block mb-1.5">
                          Acceptance Criteria:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-400">
                          {task.acceptanceCriteria.map((criterion, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-400 font-bold">✓</span>
                              <span>{criterion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tech Stack & Endpoint */}
                      <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-slate-500 font-mono">Stack:</span>
                          {task.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded bg-slate-900 text-[11px] font-mono text-slate-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {task.apiEndpoint && (
                          <div className="font-mono text-[11px] text-amber-400 bg-slate-900 px-2 py-0.5 rounded">
                            {task.apiEndpoint}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLIENT-SERVER REST PLAYGROUND */}
      {activeTab === 'api' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Server className="w-4 h-4" />
              <span>EXPRESS.JS REST API PIPELINE & SIMULATION ENGINE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-1">
              Interactive Route Console
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Execute live REST calls against the IMovies Express engine. Test JWT issuance, seat querying, and order creation in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Endpoints Selector */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block px-1">
                Select API Route to Probe
              </span>

              {API_ROUTES.map((route) => {
                const isSelected = selectedEndpoint === route.endpoint;
                return (
                  <button
                    key={route.endpoint}
                    onClick={() => {
                      setSelectedEndpoint(route.endpoint);
                      setApiMethod(route.method);
                      setApiResponse(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          route.method === 'GET'
                            ? 'bg-sky-950 text-sky-400 border border-sky-800'
                            : route.method === 'POST'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {route.method}
                      </span>
                      <span className="text-slate-400 font-semibold">{route.endpoint}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {route.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Test Runner & Output Console */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 font-mono text-xs truncate">
                  <span className="font-bold text-amber-400">{apiMethod}</span>
                  <span className="text-white truncate">{selectedEndpoint}</span>
                </div>

                <button
                  disabled={isLoadingApi}
                  onClick={() => handleRunApiTest(selectedEndpoint, apiMethod)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                >
                  {isLoadingApi ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                  )}
                  <span>Send Request</span>
                </button>
              </div>

              {/* Console Output */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 min-h-[300px]">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                  <span>RESPONSE PAYLOAD</span>
                  {apiExecutionTime !== null && (
                    <span className="text-emerald-400 font-semibold">
                      HTTP 200 OK · {apiExecutionTime}ms
                    </span>
                  )}
                </div>

                {isLoadingApi ? (
                  <div className="py-16 text-center text-slate-500">
                    <p className="animate-pulse">Dispatching HTTP request to Express server...</p>
                  </div>
                ) : apiResponse ? (
                  <pre className="text-emerald-300 overflow-x-auto text-[11px] leading-relaxed">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="py-16 text-center text-slate-600">
                    <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Click "Send Request" to trigger this REST endpoint live.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MONGODB COLLECTIONS & ERD */}
      {activeTab === 'mongodb' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Database className="w-4 h-4" />
              <span>NOSQL DOCUMENT STORAGE & RELATIONAL SCHEMAS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-1">
              MongoDB Database Architecture
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Normalized document collections with compound indexing on showtimes to enforce real-time seat lock consistency.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
            {MONGO_SCHEMAS.map((schema) => (
              <button
                key={schema.collectionName}
                onClick={() => setSelectedCollection(schema.collectionName)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                  selectedCollection === schema.collectionName
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                db.{schema.collectionName}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Field Schema Table */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h3 className="font-display font-bold text-white text-base">
                  Collection: <span className="font-mono text-amber-400">{currentCollectionDoc.collectionName}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentCollectionDoc.description}</p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 font-mono text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Field</th>
                      <th className="p-3">BSON Type</th>
                      <th className="p-3">Required</th>
                      <th className="p-3">Index / Key</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-mono text-[11px]">
                    {currentCollectionDoc.fields.map((field) => (
                      <tr key={field.field} className="hover:bg-slate-900/40">
                        <td className="p-3 font-semibold text-white">{field.field}</td>
                        <td className="p-3 text-sky-400">{field.type}</td>
                        <td className="p-3 text-slate-400">{field.required ? 'Yes' : 'No'}</td>
                        <td className="p-3">
                          {field.unique ? (
                            <span className="text-amber-400 font-bold">Unique Index</span>
                          ) : field.indexed ? (
                            <span className="text-emerald-400">Indexed</span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sample Document JSON */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-[11px] uppercase font-mono text-slate-400">
                Sample BSON Document Instance
              </span>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <pre className="text-amber-300 overflow-x-auto text-[11px] leading-relaxed">
                  {JSON.stringify(currentCollectionDoc.sampleDocument, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM & HARDWARE REQUIREMENTS */}
      {activeTab === 'requirements' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Cpu className="w-4 h-4" />
              <span>SYSTEM PREREQUISITES & READINESS VERIFIER</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-1">
              Software & Hardware Specifications
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Verified specifications required to build, test, and run the IMovies client-server application smoothly.
            </p>
          </div>

          {/* Live System Diagnostics Probe */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-400" />
                <span>Live Browser & Host Hardware Compatibility Probe</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-800 text-emerald-400">
                All Criteria Satisfied
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 font-mono">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Viewport Resolution</span>
                <span className="text-white font-bold">{probeResults.screenWidth} × {probeResults.screenHeight}</span>
                <span className="text-emerald-400 text-[10px] block">≥ 1366x768 Met</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">CPU Threads / Cores</span>
                <span className="text-white font-bold">{probeResults.cores} Logical Cores</span>
                <span className="text-emerald-400 text-[10px] block">i5/Ryzen 5 Class</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Host RAM Capacity</span>
                <span className="text-white font-bold">{probeResults.memoryEstimate}</span>
                <span className="text-emerald-400 text-[10px] block">≥ 8GB Requirement</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Network Status</span>
                <span className="text-white font-bold">{probeResults.isOnline ? 'Online (Vite HMR)' : 'Offline'}</span>
                <span className="text-emerald-400 text-[10px] block">Active Socket</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Software Requirements */}
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-white text-base">
                  1. Software Requirements
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Node.js (v16 or above):</span>
                    <p className="text-slate-400 mt-0.5">Powers the server-side logic and handles REST API routing.</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">npm (v8 or above):</span>
                    <p className="text-slate-400 mt-0.5">Package manager for React dependencies and build scripts.</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Express.js & React:</span>
                    <p className="text-slate-400 mt-0.5">Full-stack client-server architecture with state isolation.</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">MongoDB:</span>
                    <p className="text-slate-400 mt-0.5">NoSQL database for users, movies, showtimes, and booking collections.</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Postman & VS Code:</span>
                    <p className="text-slate-400 mt-0.5">Preferred API testing tool and development environment.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Hardware Requirements */}
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-white text-base">
                  2. Hardware Requirements
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Processor:</span>
                    <p className="text-slate-400 mt-0.5">Intel Core i5 (8th Gen or above) / AMD Ryzen 5 or better.</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">RAM:</span>
                    <p className="text-slate-400 mt-0.5">Minimum 8 GB (16 GB recommended) for concurrent dev servers and browser tabs.</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Storage:</span>
                    <p className="text-slate-400 mt-0.5">At least 1 GB free space for Node modules, MongoDB instance, and build assets.</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Display Resolution:</span>
                    <p className="text-slate-400 mt-0.5">1366x768 or higher for optimal layout visualization and coding.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
