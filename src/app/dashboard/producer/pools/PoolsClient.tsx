"use client";

import { useState } from "react";
import { Users, Plus, Loader2, ArrowRight } from "lucide-react";
import CreatePoolModal from "./CreatePoolModal";
import JoinPoolModal from "./JoinPoolModal";

export default function PoolsClient({ userId, availablePools, myContributions, userRegion, userCategory }: any) {
    const [activeTab, setActiveTab] = useState("available"); // "available" | "mine"
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const [poolToJoin, setPoolToJoin] = useState<any | null>(null);

    // State untuk pools (supaya update instan di UI saat nambah/gabung)
    const [availPools, setAvailPools] = useState(availablePools);
    const [myPools, setMyPools] = useState(myContributions);

    const handleCreateSuccess = (newPool: any) => {
        setAvailPools((prev: any) => [newPool, ...prev]);
        setIsCreateModalOpen(false);
    };

    const handleJoinSuccess = (contribution: any, updatedPool: any) => {
        // Pindah ke tab "mine"
        const newMyPools = [{ pool_id: updatedPool.id, quantity_committed: contribution.quantity_committed, pools: updatedPool }, ...myPools];
        setMyPools(newMyPools);
        
        // Update availPools (kalau pool penuh, hilangkan atau ubah status)
        if (updatedPool.status !== 'open') {
            setAvailPools((prev: any) => prev.filter((p: any) => p.id !== updatedPool.id));
        } else {
            setAvailPools((prev: any) => prev.map((p: any) => p.id === updatedPool.id ? updatedPool : p));
        }

        setPoolToJoin(null);
        setActiveTab("mine");
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Kelola Kolaborasi Pool</h1>
                    <p className="text-gray-500">Bergabung dengan produsen lain untuk memenuhi kuota pasar besar.</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Buat Pool Baru
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="flex border-b border-gray-200">
                    <button 
                        onClick={() => setActiveTab("available")}
                        className={`flex-1 py-4 font-bold text-center transition-colors border-b-2 ${activeTab === 'available' ? 'border-brand-600 text-brand-600 bg-brand-50/50' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                    >
                        Pool Bisa Diikuti
                    </button>
                    <button 
                        onClick={() => setActiveTab("mine")}
                        className={`flex-1 py-4 font-bold text-center transition-colors border-b-2 ${activeTab === 'mine' ? 'border-brand-600 text-brand-600 bg-brand-50/50' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                    >
                        Pool Saya
                    </button>
                </div>
            </div>

            {activeTab === "available" && (
                <div>
                    {availPools.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Pool Terbuka</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                Saat ini tidak ada Pool patungan yang terbuka untuk wilayah ({userRegion}) dan kategori ({userCategory}) Anda. Jadilah inisiator pertama!
                            </p>
                            <button onClick={() => setIsCreateModalOpen(true)} className="text-brand-600 font-bold bg-brand-50 px-6 py-2.5 rounded-full hover:bg-brand-100 transition-colors">
                                Mulai Pool Baru
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {availPools.map((pool: any) => {
                                const percentage = Math.min(100, Math.round((pool.collected_quantity / pool.target_quantity) * 100));
                                return (
                                    <div key={pool.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{pool.title}</h3>
                                                <p className="text-sm text-gray-500">Ditutup: {new Date(pool.deadline).toLocaleDateString('id-ID')}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Buka</span>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Terkumpul: <strong>{pool.collected_quantity}</strong> / {pool.target_quantity} {pool.unit}</span>
                                                <span className="font-bold text-brand-600">{percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div className="bg-brand-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                                            <div>
                                                <p className="text-xs text-gray-500">Harga Jual / {pool.unit}</p>
                                                <p className="font-bold text-gray-900">Rp{pool.price.toLocaleString('id-ID')}</p>
                                            </div>
                                            <button 
                                                onClick={() => setPoolToJoin(pool)}
                                                className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                            >
                                                Ikut Gabung <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "mine" && (
                <div>
                    {myPools.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Anda Belum Mengikuti Pool</h3>
                            <p className="text-gray-500">Gabung dengan Pool yang ada untuk mendongkrak penjualan dalam jumlah besar bersama produsen lain.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {myPools.map((contrib: any) => {
                                const pool = contrib.pools;
                                const percentage = Math.min(100, Math.round((pool.collected_quantity / pool.target_quantity) * 100));
                                const estIncome = contrib.quantity_committed * pool.price;
                                
                                return (
                                    <div key={pool.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{pool.title}</h3>
                                                <p className="text-sm text-gray-500">Batas Waktu: {new Date(pool.deadline).toLocaleDateString('id-ID')}</p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                pool.status === 'open' ? 'bg-green-100 text-green-800' :
                                                pool.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {pool.status.toUpperCase()}
                                            </span>
                                        </div>
                                        
                                        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-sm text-gray-500 mb-1">Kontribusi Anda:</p>
                                            <div className="flex items-end justify-between">
                                                <p className="font-bold text-xl text-gray-900">{contrib.quantity_committed} <span className="text-sm text-gray-500 font-medium">{pool.unit}</span></p>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 mb-0.5">Estimasi Pendapatan</p>
                                                    <p className="font-bold text-green-600">Rp{estIncome.toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Total Pool Terkumpul: {pool.collected_quantity} / {pool.target_quantity} {pool.unit}</span>
                                            <span className="font-bold text-gray-900">{percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {isCreateModalOpen && (
                <CreatePoolModal 
                    onClose={() => setIsCreateModalOpen(false)} 
                    onSuccess={handleCreateSuccess}
                    userId={userId}
                    userRegion={userRegion}
                    userCategory={userCategory}
                />
            )}

            {poolToJoin && (
                <JoinPoolModal
                    pool={poolToJoin}
                    userId={userId}
                    onClose={() => setPoolToJoin(null)}
                    onSuccess={handleJoinSuccess}
                />
            )}
        </div>
    );
}
