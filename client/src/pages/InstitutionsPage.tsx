import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient } from '../services/api';
import { Institution } from '../types';
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Mail,
  Calendar,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const InstitutionsPage: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const navigate = useNavigate();

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (selectedState) params.state = selectedState;
      if (selectedType) params.type = selectedType;

      const res = await ApiClient.getInstitutions(params);
      if (res.success) {
        setInstitutions(res.institutions);
      }
    } catch (err) {
      console.error('Failed to load institutions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [selectedState, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInstitutions();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Participating AICTE Approved Institutions
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Technical institutes, universities, and PGDM colleges integrated into the CREDEN governance network.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121212] border border-[#262626] flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by institution name, code, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-[#0A0A0A] border border-[#262626] text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
          >
            <option value="">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Punjab">Punjab</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#0A0A0A] border border-[#262626] text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
          >
            <option value="">All Institution Types</option>
            <option value="STATE_TECHNICAL_UNIVERSITY">State Technical University</option>
            <option value="CENTRAL_UNIVERSITY">Central University</option>
            <option value="AUTONOMOUS_COLLEGE">Autonomous College</option>
            <option value="PGDM_INSTITUTION">PGDM Institution</option>
          </select>
        </div>
      </div>

      {/* Institution Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-slate-400">Loading institutions directory...</div>
        ) : institutions.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-slate-400">No matching institutions found.</div>
        ) : (
          institutions.map((inst) => (
            <div
              key={inst.id}
              onClick={() => navigate(`/institutions/${inst.id}`)}
              className="p-6 rounded-2xl bg-[#121212] border border-[#222222] hover:border-neutral-500 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {inst.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <span className="text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-wider block mb-1">
                  {inst.institutionCode}
                </span>
                <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-neutral-200 transition-colors">
                  {inst.name}
                </h3>
                <p className="text-xs text-neutral-400 mb-4">
                  {inst.institutionType.replace(/_/g, ' ')}
                </p>

                <div className="space-y-1.5 text-xs text-neutral-400 pt-3 border-t border-[#222222]">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{inst.city}, {inst.state}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="truncate">{inst.contactEmail}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#222222] flex items-center justify-between text-xs">
                <span className="text-neutral-500">Established: {inst.approvedYear}</span>
                <span className="text-white font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

