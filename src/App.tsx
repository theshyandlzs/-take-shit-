/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  BarChart3, 
  User, 
  Bell, 
  Frown, 
  Droplets, 
  Utensils, 
  ArrowRight, 
  ChevronRight, 
  Camera, 
  CheckCircle2, 
  Smartphone, 
  Zap, 
  CircleDashed, 
  AlertCircle,
  ChevronLeft,
  Settings,
  Search,
  Info,
  ShieldCheck,
  LogOut,
  MapPin,
  Clock,
  Coffee,
  Sun,
  Accessibility,
  Footprints,
  Armchair,
  Smartphone as SmartphoneOff,
  Wind,
  Lightbulb
} from 'lucide-react';
import { Screen, StoolRecord, AnalysisResult, ApiProvider, ProviderType } from './types';
import { analyzeStoolImage } from './services/aiService';
import { Plus, Trash2, Check, ExternalLink } from 'lucide-react';

// --- Components ---

const BottomNav = ({ currentScreen, setScreen }: { currentScreen: Screen, setScreen: (s: Screen) => void }) => {
  const navItems: { id: Screen; label: string; icon: any }[] = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'record', label: '记录', icon: BookOpen },
    { id: 'academy', label: '学院', icon: GraduationCap },
    { id: 'report', label: '报告', icon: BarChart3 },
    { id: 'profile', label: '我的', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-4 pb-6 pt-2 bg-white/80 backdrop-blur-xl rounded-t-[3rem] shadow-[0_-8px_24px_rgba(57,104,70,0.08)]">
      {navItems.map((item) => {
        const isActive = currentScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            className={`flex flex-col items-center justify-center transition-all duration-300 ease-out ${
              isActive 
                ? 'bg-primary-container text-primary rounded-full h-14 w-14 mb-2 shadow-lg scale-110' 
                : 'text-outline p-2 hover:text-primary'
            }`}
          >
            <item.icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="font-sans font-bold text-[10px] mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

const Header = ({ title, showBack, onBack }: { title: string, showBack?: boolean, onBack?: () => void }) => (
  <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md w-full flex items-center justify-between px-6 py-4">
    <div className="flex items-center gap-3">
      {showBack ? (
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-surface-container rounded-full transition-colors">
          <ChevronLeft className="text-primary" />
        </button>
      ) : (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container border-2 border-white shadow-sm">
          <img 
            src="https://picsum.photos/seed/user/100/100" 
            alt="User" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col">
        {!showBack && <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider opacity-70">早安，拉拉队员</span>}
        <h1 className="font-sans font-black text-2xl tracking-tight text-primary italic">{title}</h1>
      </div>
    </div>
    <button className="p-2 text-outline hover:text-primary transition-colors">
      <Bell size={24} />
    </button>
  </header>
);

// --- Screens ---

const HomeScreen = ({ records, onStartRecord, onDeleteRecord }: { records: StoolRecord[], onStartRecord: () => void, onDeleteRecord: (id: string) => void }) => {
  const lastRecord = records[0];
  const lastTime = lastRecord ? new Date(lastRecord.timestamp).toLocaleString() : '暂无记录';
  const streak = records.length > 0 ? 4 : 0; // Placeholder for streak logic

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-32 pt-4 px-6 max-w-2xl mx-auto space-y-8"
    >
      {/* Main Status Card */}
      <section className="relative">
        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0_24px_48px_-12px_rgba(57,104,70,0.08)] overflow-hidden border border-outline-variant/20">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-5">
            <Droplets size={160} className="text-primary" />
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center shadow-inner">
              {records.length > 0 ? (
                <CheckCircle2 size={48} className="text-primary" />
              ) : (
                <Frown size={48} className="text-primary opacity-40" />
              )}
            </div>
            <div>
              <h2 className="font-sans font-black text-3xl mb-1">
                {records.length > 0 ? '今天已经拉过啦！' : '今天还没拉？'}
              </h2>
              <p className="text-on-surface-variant text-sm tracking-wide font-medium">
                累计 {records.length} 次 · 上次是 {lastTime}
              </p>
            </div>
            {/* Streak Indicator */}
            <div className="flex items-center gap-2 pt-4 w-full justify-center">
              <div className="flex gap-1.5">
                {[1, 1, 1, 1, 0.5, 0, 0].map((v, i) => (
                  <div 
                    key={i} 
                    className={`w-8 h-2 rounded-full ${v === 1 ? 'bg-primary' : v === 0.5 ? 'bg-primary-container' : 'bg-surface-container-high'}`} 
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-primary ml-2 uppercase tracking-tighter">{streak}天连胜</span>
            </div>
          </div>
        </div>
      </section>

      {/* Action Area */}
      <section className="grid grid-cols-1 gap-4">
        <button 
          onClick={onStartRecord}
          className="h-16 w-full rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-lg shadow-[0_8px_24px_rgba(57,104,70,0.2)] active:scale-95 transition-transform"
        >
          现在去拉
        </button>
        <button 
          onClick={onStartRecord}
          className="h-16 w-full rounded-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-bold text-lg active:scale-95 transition-transform shadow-sm"
        >
          刚拉完，记一下
        </button>
      </section>

      {/* Recent History */}
      {records.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans font-black text-xl">最近记录</h3>
          </div>
          <div className="space-y-3">
            {records.slice(0, 3).map((record) => (
              <div key={record.id} className="bg-surface-container-lowest p-4 rounded-2xl flex items-center justify-between shadow-sm border border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{new Date(record.timestamp).toLocaleDateString()} {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[10px] text-on-surface-variant font-medium">形状: {record.shape} · 顺利度: {record.smoothness}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteRecord(record.id)}
                  className="p-2 text-outline-variant hover:text-tertiary transition-colors"
                >
                  <AlertCircle size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Today's Suggestions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans font-black text-xl">今日建议</h3>
          <span className="text-primary text-sm font-bold cursor-pointer hover:underline">查看全部</span>
        </div>
        <div className="flex overflow-x-auto gap-4 hide-scrollbar -mx-6 px-6">
          <div className="min-w-[280px] bg-secondary-container p-6 rounded-3xl flex flex-col justify-between h-40 shadow-sm">
            <div className="bg-white/40 w-10 h-10 rounded-full flex items-center justify-center">
              <Utensils size={20} className="text-secondary" />
            </div>
            <p className="font-bold text-on-secondary-container leading-tight text-lg">早餐后是排便的黄金时间，记得尝试一下哦。</p>
          </div>
          <div className="min-w-[280px] bg-primary-container p-6 rounded-3xl flex flex-col justify-between h-40 shadow-sm">
            <div className="bg-white/40 w-10 h-10 rounded-full flex items-center justify-center">
              <Armchair size={20} className="text-primary" />
            </div>
            <p className="font-bold text-on-primary-container leading-tight text-lg">试试配合小板凳，身体前倾，姿势更顺畅。</p>
          </div>
        </div>
      </section>

      {/* Life Tracking */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans font-black text-xl">生活追踪</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface-container-lowest p-4 rounded-2xl flex flex-col items-center justify-center text-center aspect-square shadow-sm border border-outline-variant/10">
            <Droplets size={24} className="text-primary mb-2" />
            <span className="text-xs font-bold block">喝水</span>
            <span className="text-[10px] text-on-surface-variant font-medium">1200ml</span>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl flex flex-col items-center justify-center text-center aspect-square shadow-sm border border-outline-variant/10">
            <Footprints size={24} className="text-secondary mb-2" />
            <span className="text-xs font-bold block">运动</span>
            <span className="text-[10px] text-on-surface-variant font-medium">30min</span>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl flex flex-col items-center justify-center text-center aspect-square shadow-sm border-2 border-dashed border-outline-variant/50">
            <Zap size={24} className="text-tertiary mb-2" />
            <span className="text-xs font-bold block">今日尝试</span>
            <span className="text-[10px] text-on-surface-variant font-medium">火龙果</span>
          </div>
        </div>
      </section>

      {/* Academy Shortcuts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans font-black text-xl">拉拉学院</h3>
          <ArrowRight className="text-on-surface-variant cursor-pointer" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { title: '别坐太久！久坐的危害', img: 'https://picsum.photos/seed/yoga/300/225' },
            { title: '拒绝用力：轻松排便法', img: 'https://picsum.photos/seed/fruit/300/225' },
            { title: '到底什么是正常的？', img: 'https://picsum.photos/seed/medical/300/225' },
            { title: '正确姿势图解手册', img: 'https://picsum.photos/seed/bathroom/300/225' },
          ].map((item, i) => (
            <div key={i} className="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:bg-surface-container transition-colors cursor-pointer">
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-200">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-bold leading-tight line-clamp-2">{item.title}</span>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

const RecordScreen = ({ onFinish, onAnalyze }: { onFinish: (record: StoolRecord) => void, onAnalyze: (image: string) => Promise<void> }) => {
  const [step, setStep] = useState(1); // 1: Timer, 2: Details, 3: Image
  const [seconds, setSeconds] = useState(0);
  const [record, setRecord] = useState<Partial<StoolRecord>>({
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    smoothness: 'normal',
    shape: 3,
    color: '#E6B441',
    phoneUsed: false,
    strained: false,
    incomplete: false,
    painful: false,
    posture: '前倾',
  });
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    let interval: any;
    if (step === 1) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setStep(3);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = async () => {
    if (image) {
      setIsAnalyzing(true);
      try {
        await onAnalyze(image);
      } catch (error) {
        console.error("Analysis failed:", error);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      onFinish(record as StoolRecord);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-40 pt-4 px-6 max-w-md mx-auto w-full space-y-10"
    >
      {step === 1 ? (
        <>
          <section className="text-center space-y-2 pt-8">
            <div className="inline-block px-4 py-1 rounded-full bg-primary-container/20 text-primary font-bold text-sm mb-4">
              计时进行中
            </div>
            <h2 className="font-sans font-black text-7xl tracking-tighter text-primary drop-shadow-sm">
              {formatTime(seconds)}
            </h2>
            <p className="text-on-surface-variant font-medium tracking-wide">持续时间</p>
          </section>

          <div className="bg-surface-container-low rounded-3xl p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
              <Lightbulb size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-primary mb-0.5">温馨提醒</h3>
              <p className="text-on-surface font-medium">先放松，别急着用力</p>
            </div>
          </div>

          <section className="relative aspect-square flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/5 rounded-full scale-90"></div>
            <div className="relative w-full h-full p-8">
              <img 
                src="https://picsum.photos/seed/meditation/400/400" 
                alt="Guide" 
                className="w-full h-full object-cover rounded-3xl opacity-80 mix-blend-multiply" 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-primary/10">
                  <Accessibility size={48} className="text-primary mb-2 mx-auto" />
                  <p className="text-xs font-bold text-primary">推荐姿势：身体前倾，脚踏矮凳</p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-wrap justify-center gap-3">
            {[
              { icon: SmartphoneOff, label: '不看手机' },
              { icon: Wind, label: '放松呼吸' },
              { icon: AlertCircle, label: '不猛用力' },
            ].map((item, i) => (
              <div key={i} className="px-5 py-3 rounded-full bg-surface-container-highest flex items-center space-x-2 shadow-sm">
                <item.icon size={18} className="text-secondary" />
                <span className="text-sm font-bold text-on-surface-variant">{item.label}</span>
              </div>
            ))}
          </section>

          <footer className="fixed bottom-0 left-0 w-full p-6 bg-white/80 backdrop-blur-xl rounded-t-[3rem] shadow-[0_-8px_24px_rgba(57,104,70,0.08)]">
            <div className="max-w-md mx-auto flex flex-col gap-4">
              <button 
                onClick={() => setStep(2)}
                className="h-16 w-full rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-sans font-bold text-lg shadow-[0_8px_24px_rgba(57,104,70,0.2)] flex items-center justify-center space-x-2 active:scale-[0.98] transition-all"
              >
                <CheckCircle2 size={24} />
                <span>完成了</span>
              </button>
              <div className="grid grid-cols-2 gap-4">
                <label className="h-14 rounded-full bg-surface-container-high text-on-surface-variant font-bold text-sm flex items-center justify-center active:scale-95 transition-all cursor-pointer">
                  <Camera size={18} className="mr-2" />
                  拍照分析
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <button 
                  onClick={() => setStep(2)}
                  className="h-14 rounded-full text-tertiary font-bold text-sm flex items-center justify-center active:scale-95 transition-all"
                >
                  结束本次
                </button>
              </div>
            </div>
          </footer>
        </>
      ) : step === 2 ? (
        <div className="space-y-10 pb-40">
          <section className="space-y-4">
            <h2 className="text-xl font-bold px-2">本次顺利吗</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'smooth', label: '非常顺畅', color: 'text-primary' },
                { id: 'normal', label: '一般般', color: 'text-secondary' },
                { id: 'hard', label: '有点费劲', color: 'text-tertiary' },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setRecord({ ...record, smoothness: item.id as any })}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl shadow-sm transition-all ${
                    record.smoothness === item.id ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container-lowest'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${record.smoothness === item.id ? 'bg-white/20' : 'bg-surface-container-low'}`}>
                    <CheckCircle2 size={24} className={record.smoothness === item.id ? 'text-white' : item.color} />
                  </div>
                  <span className="text-sm font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold">本次形状</h2>
              <span className="text-xs text-outline font-medium">布里斯托分类</span>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-2">
              {[
                { val: 1, label: '硬球状', icon: '🌰' },
                { val: 2, label: '香肠状(硬)', icon: '🌭' },
                { val: 3, label: '香蕉状', icon: '🍌' },
                { val: 4, label: '松软块状', icon: '☁️' },
                { val: 6, label: '水样/泥状', icon: '💧' },
              ].map((item) => (
                <button 
                  key={item.val} 
                  onClick={() => setRecord({ ...record, shape: item.val })}
                  className="flex-shrink-0 flex flex-col items-center gap-3 w-20"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                    record.shape === item.val ? 'bg-primary-container shadow-lg scale-110' : 'bg-surface-container-high'
                  }`}>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <span className={`text-[11px] font-bold text-center ${record.shape === item.val ? 'text-primary' : ''}`}>{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold px-2">本次颜色</h2>
            <div className="flex justify-between items-center px-2">
              {[
                { color: '#E6B441', label: '金黄' },
                { color: '#8B5E3C', label: '褐色' },
                { color: '#4A3728', label: '偏深' },
                { color: '#D7C0AE', label: '偏浅' },
              ].map((item) => (
                <button 
                  key={item.label} 
                  onClick={() => setRecord({ ...record, color: item.color })}
                  className="flex flex-col items-center gap-2"
                >
                  <div 
                    className={`w-12 h-12 rounded-full shadow-sm transition-all ${record.color === item.color ? 'ring-offset-4 ring-2 ring-primary scale-110' : ''}`}
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`text-xs font-bold ${record.color === item.color ? 'text-primary' : 'text-outline'}`}>{item.label}</span>
                </button>
              ))}
              <button className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center border-2 border-dashed border-outline-variant">
                  <Settings size={20} className="text-outline" />
                </div>
                <span className="text-xs font-bold text-outline">其他</span>
              </button>
            </div>
          </section>

          <section className="bg-surface-container-low rounded-[2.5rem] p-6 space-y-6 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CircleDashed size={20} className="text-secondary" />
                <h2 className="text-lg font-bold">进阶信息</h2>
              </div>
              <ChevronRight size={20} className="text-outline rotate-90" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'phoneUsed', label: '玩手机了?', icon: Smartphone },
                { id: 'strained', label: '憋得慌?', icon: Zap, color: 'text-tertiary' },
                { id: 'incomplete', icon: CircleDashed, label: '没拉干净?' },
                { id: 'painful', icon: AlertCircle, label: '有痛感?', color: 'text-tertiary' },
              ].map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => setRecord({ ...record, [item.id]: !((record as any)[item.id]) })}
                  className={`flex items-center justify-between p-4 rounded-2xl shadow-sm active:scale-95 transition-transform ${
                    (record as any)[item.id] ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest'
                  }`}
                >
                  <span className="text-sm font-bold">{item.label}</span>
                  <item.icon size={18} className={(record as any)[item.id] ? 'text-white' : (item.color || 'text-primary')} />
                </button>
              ))}
            </div>
          </section>

          <footer className="fixed bottom-0 left-0 w-full p-6 bg-white/80 backdrop-blur-xl rounded-t-[3rem] shadow-[0_-8px_24px_rgba(57,104,70,0.08)]">
            <div className="max-w-md mx-auto flex flex-col items-center gap-4">
              <button 
                onClick={handleFinish}
                className="w-full h-16 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-sans font-black text-lg shadow-[0_8px_24px_rgba(57,104,70,0.2)] active:scale-95 transition-transform"
              >
                保存记录
              </button>
              <button 
                onClick={() => onFinish(record as StoolRecord)}
                className="text-primary font-bold text-sm tracking-wide opacity-60 hover:opacity-100 transition-opacity"
              >
                仅保存核心数据
              </button>
            </div>
          </footer>
        </div>
      ) : (
        <div className="space-y-10 pb-40 flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-black text-primary italic">确认分析图片</h2>
          <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative">
            <img src={image!} alt="To analyze" className="w-full h-full object-cover" />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-4">
                <CircleDashed className="animate-spin" size={48} />
                <p className="font-bold tracking-widest">AI 正在深度分析中...</p>
              </div>
            )}
          </div>
          <div className="flex flex-col w-full gap-4">
            <button 
              disabled={isAnalyzing}
              onClick={handleFinish}
              className="w-full h-16 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-sans font-black text-lg shadow-[0_8px_24px_rgba(57,104,70,0.2)] active:scale-95 transition-transform disabled:opacity-50"
            >
              {isAnalyzing ? '分析中...' : '开始 AI 分析'}
            </button>
            <button 
              disabled={isAnalyzing}
              onClick={() => { setImage(null); setStep(1); }}
              className="w-full h-16 rounded-full bg-surface-container-high text-on-surface font-bold text-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              重新拍摄
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const AcademyScreen = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32 px-6 max-w-2xl mx-auto space-y-10"
    >
      <section className="mt-6">
        <div className="mb-4 flex justify-between items-end">
          <h2 className="font-sans font-extrabold text-2xl text-on-surface">今日推荐</h2>
          <span className="text-primary font-bold text-sm cursor-pointer">查看全部</span>
        </div>
        <div className="flex overflow-x-auto px-0 gap-4 no-scrollbar">
          <div className="flex-shrink-0 w-[85%] aspect-[16/10] rounded-3xl relative overflow-hidden bg-primary-container shadow-lg">
            <img src="https://picsum.photos/seed/brain/600/400" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-40" />
            <div className="relative h-full p-6 flex flex-col justify-end">
              <span className="bg-white/90 text-primary px-3 py-1 rounded-full text-xs font-bold w-fit mb-2">深度解析</span>
              <h3 className="font-sans font-black text-2xl text-on-primary-container leading-tight">肠道微生态：你的第二大脑</h3>
            </div>
          </div>
          <div className="flex-shrink-0 w-[85%] aspect-[16/10] rounded-3xl relative overflow-hidden bg-secondary-container shadow-lg">
            <img src="https://picsum.photos/seed/veggies/600/400" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-30" />
            <div className="relative h-full p-6 flex flex-col justify-end">
              <span className="bg-white/90 text-secondary px-3 py-1 rounded-full text-xs font-bold w-fit mb-2">饮食建议</span>
              <h3 className="font-sans font-black text-2xl text-on-secondary-container leading-tight">如何通过饮食改变“质地”</h3>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-sans font-extrabold text-2xl text-on-surface mb-6">常见错误</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Clock, label: '时间太长' },
            { icon: Zap, label: '用力过猛' },
            { icon: ArrowRight, label: '擦拭方向' },
            { icon: Droplets, label: '便后洗手' },
          ].map((item, i) => (
            <div key={i} className="bg-surface-container-low p-5 rounded-3xl flex flex-col items-center text-center gap-3 shadow-sm border border-outline-variant/10">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                <item.icon size={28} />
              </div>
              <span className="font-bold text-on-surface leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-sans font-extrabold text-2xl text-on-surface mb-6">什么样算正常</h2>
        <div className="flex flex-col gap-4">
          {[
            { icon: Settings, label: '看颜色', desc: '从金黄到深褐的秘密', bg: 'bg-tertiary-container/30', color: 'text-tertiary' },
            { icon: CircleDashed, label: '看形状', desc: '布里斯托分类法详解', bg: 'bg-primary-container/30', color: 'text-primary' },
            { icon: BarChart3, label: '看频率', desc: '每天三次到三天一次？', bg: 'bg-secondary-container/30', color: 'text-secondary' },
          ].map((item, i) => (
            <div key={i} className="bg-surface-container-lowest p-4 rounded-full flex items-center gap-4 shadow-sm border border-outline-variant/10 cursor-pointer hover:bg-surface-container transition-colors">
              <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center ${item.color}`}>
                <item.icon size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold">{item.label}</p>
                <p className="text-xs text-on-surface-variant font-medium">{item.desc}</p>
              </div>
              <ChevronRight className="text-outline-variant pr-2" />
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

const ReportScreen = ({ records }: { records: StoolRecord[] }) => {
  const weeklyCount = records.filter(r => {
    const d = new Date(r.timestamp);
    const now = new Date();
    return d > new Date(now.setDate(now.getDate() - 7));
  }).length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32 px-6 max-w-2xl mx-auto space-y-10"
    >
      <section>
        <h2 className="text-4xl font-black text-on-surface tracking-tight mb-2">报告</h2>
        <p className="text-on-surface-variant font-medium">查看你的肠道健康趋势与深度见解</p>
      </section>

      <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0_8px_32px_rgba(57,104,70,0.04)] relative overflow-hidden border border-outline-variant/10">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <BarChart3 size={160} className="text-primary" />
        </div>
        <div className="relative z-10">
          <h3 className="text-on-surface-variant font-bold mb-6 flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            本周总览
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-sm text-on-surface-variant block font-medium">排便次数</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-primary tracking-tighter">{weeklyCount}</span>
                <span className="text-sm font-bold text-on-surface-variant">次</span>
              </div>
              <span className="text-[10px] bg-primary-container/30 text-primary px-2 py-0.5 rounded-full font-bold">
                {weeklyCount >= 3 ? '处于正常范围' : '次数偏少'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-on-surface-variant block font-medium">平均时长</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-secondary tracking-tighter">6.5</span>
                <span className="text-sm font-bold text-on-surface-variant">分钟</span>
              </div>
              <span className="text-[10px] bg-secondary-container/30 text-secondary px-2 py-0.5 rounded-full font-bold">比上周快 12%</span>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-surface-container-low grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-on-surface-variant font-medium">顺利度指数</span>
              <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-container w-[85%] rounded-full"></div>
              </div>
              <span className="text-xs font-bold text-primary">非常顺利 (85/100)</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-on-surface-variant font-medium">形态多样性</span>
              <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-secondary to-secondary-container w-[60%] rounded-full"></div>
              </div>
              <span className="text-xs font-bold text-secondary">良好平衡 (60/100)</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-2xl font-black tracking-tight px-1">关键洞察</h3>
        <div className="grid grid-cols-1 gap-4">
          {[
            { icon: Sun, label: '早晨是你的黄金时间', desc: '75% 的记录发生在 7:00 - 9:00 之间，且顺利度最高。建议保持此晨间律动。', bg: 'bg-primary-container/20', color: 'bg-primary' },
            { icon: Smartphone, label: '手机使用延长了时长', desc: '当标记“使用手机”时，平均时长增加了 4.5 分钟。尝试放下设备以提高效率。', bg: 'bg-tertiary-container/20', color: 'bg-tertiary' },
            { icon: Coffee, label: '咖啡因的正向驱动', desc: '摄入咖啡后 30 分钟内的排便记录通常伴随更高的“顺利度”评分。', bg: 'bg-secondary-container/20', color: 'bg-secondary' },
          ].map((item, i) => (
            <div key={i} className={`${item.bg} p-6 rounded-2xl flex items-start gap-4 shadow-sm`}>
              <div className={`w-12 h-12 ${item.color} rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-md`}>
                <item.icon size={24} />
              </div>
              <div>
                <h4 className="font-bold text-on-surface mb-1">{item.label}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-2xl font-black tracking-tight">趋势分析</h3>
          <div className="flex bg-surface-container rounded-full p-1">
            <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-white shadow-sm text-primary">次数</button>
            <button className="px-4 py-1.5 rounded-full text-xs font-bold text-on-surface-variant">时长</button>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/10">
          <div className="flex items-end justify-between h-48 gap-2 pt-4">
            {[60, 40, 80, 50, 70, 95, 30].map((h, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-primary-container/20 rounded-t-full relative flex flex-col justify-end" style={{ height: '100%' }}>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="w-full bg-primary rounded-t-full shadow-sm" 
                  />
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant">周{['一', '二', '三', '四', '五', '六', '日'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12">
        <button className="w-full h-16 bg-gradient-to-br from-primary to-primary-container rounded-full flex items-center justify-center gap-3 text-on-primary font-bold text-lg shadow-[0_8px_24px_rgba(57,104,70,0.2)] active:scale-[0.98] transition-transform">
          <span>查看完整周报</span>
          <ArrowRight size={20} />
        </button>
      </section>
    </motion.div>
  );
};

const ProfileScreen = ({ records, onOpenApiSettings }: { records: StoolRecord[], onOpenApiSettings: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 pt-4 max-w-2xl mx-auto space-y-8 pb-32"
    >
      <section className="relative overflow-hidden bg-surface-container-lowest rounded-3xl p-8 shadow-[0_8px_32px_rgba(57,104,70,0.05)] border border-outline-variant/10">
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-primary-container p-1 shadow-md">
              <img src="https://picsum.photos/seed/avatar2/200/200" alt="Avatar" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-black text-on-surface mb-1 tracking-tight">苏格拉底</h2>
            <p className="text-on-surface-variant font-bold text-sm flex items-center gap-1 opacity-70">
              <MapPin size={14} />
              健康探索者
            </p>
          </div>
        </div>
        <div className="mt-8 flex gap-4">
          <div className="flex-1 bg-surface-container-low rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-primary font-black text-3xl mb-1">{records.length > 0 ? 12 : 0}</span>
            <span className="text-on-surface-variant text-[11px] font-bold tracking-widest uppercase">连续记录天数</span>
          </div>
          <div className="flex-1 bg-primary-container/30 rounded-2xl p-5 flex flex-col items-center justify-center text-center border border-primary-container/20 shadow-sm">
            <span className="text-primary font-black text-3xl mb-1">{records.length > 0 ? '98%' : '0%'}</span>
            <span className="text-on-surface-variant text-[11px] font-bold tracking-widest uppercase">健康达成率</span>
          </div>
        </div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
      </section>

      <section className="space-y-3">
        <h3 className="px-2 text-on-surface-variant font-black text-xs tracking-[0.2em] uppercase opacity-50 mb-4">个人中心</h3>
        <div className="bg-surface-container-low rounded-3xl overflow-hidden shadow-sm border border-outline-variant/10">
          {[
            { icon: Bell, label: '提醒设置', bg: 'bg-secondary-container/50', color: 'text-secondary' },
            { icon: BookOpen, label: '记录偏好', bg: 'bg-primary-container/50', color: 'text-primary' },
            { icon: Zap, label: '健康偏好', bg: 'bg-tertiary-container/30', color: 'text-tertiary' },
            { icon: ShieldCheck, label: '数据与隐私', bg: 'bg-surface-container-high', color: 'text-on-surface-variant' },
            { icon: Settings, label: 'API 设置', bg: 'bg-primary-container/20', color: 'text-primary', onClick: onOpenApiSettings },
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={item.onClick}
              className="w-full flex items-center justify-between px-6 py-5 hover:bg-surface-container transition-colors border-b border-outline-variant/10 last:border-none"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <span className="font-bold text-on-surface text-lg">{item.label}</span>
              </div>
              <ChevronRight className="text-outline-variant" />
            </button>
          ))}
        </div>
        <button className="w-full bg-surface-container-lowest rounded-3xl flex items-center justify-between px-6 py-5 shadow-sm border border-outline-variant/10 hover:bg-white transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
              <Info size={24} />
            </div>
            <span className="font-bold text-on-surface text-lg">关于与免责声明</span>
          </div>
          <ArrowRight size={20} className="text-outline-variant" />
        </button>
      </section>

      <div className="pt-4 pb-8 text-center">
        <button className="text-tertiary font-bold text-sm tracking-widest uppercase py-4 px-12 rounded-full hover:bg-tertiary-container/20 transition-colors">
          退出登录
        </button>
        <p className="mt-6 text-[10px] text-outline-variant font-bold tracking-tighter opacity-40">
          VERSION 2.4.0 (2024.11) • CRAFTED WITH CARE
        </p>
      </div>
    </motion.div>
  );
};

const AnalysisScreen = ({ result, onFinish }: { result: AnalysisResult | null, onFinish: () => void }) => {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-4">
        <AlertCircle size={48} className="text-outline opacity-20" />
        <p className="text-on-surface-variant font-bold">暂无分析数据</p>
        <button onClick={onFinish} className="text-primary font-bold">返回首页</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-6 pt-6 space-y-8 max-w-2xl mx-auto pb-32"
    >
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-container p-8 text-on-primary shadow-xl">
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 shadow-inner">
            <CheckCircle2 size={48} className="text-white" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold tracking-widest uppercase opacity-80">最终评估结果</p>
            <h2 className="text-4xl font-sans font-black">状态：{result.status}</h2>
          </div>
          <div className="bg-white/10 px-6 py-2 rounded-full backdrop-blur-sm border border-white/10">
            <p className="text-sm font-bold">分析置信度：{(result.confidence * 100).toFixed(1)}%</p>
          </div>
        </div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary-fixed-dim/20 rounded-full blur-2xl"></div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-surface-container-lowest rounded-3xl p-6 space-y-6 shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3">
            <Search size={24} className="text-primary" />
            <h3 className="font-sans font-bold text-xl">关键观察</h3>
          </div>
          <div className="space-y-4">
            {result.observations.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container-low">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  item.type === 'positive' ? 'bg-primary' : item.type === 'negative' ? 'bg-tertiary' : 'bg-secondary'
                }`} />
                <div>
                  <p className="font-bold text-on-surface">{item.title}</p>
                  <p className="text-sm text-on-surface-variant font-medium">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-3xl p-6 space-y-6 shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3">
            <Lightbulb size={24} className="text-secondary" />
            <h3 className="font-sans font-bold text-xl">个性化建议</h3>
          </div>
          <div className="space-y-6">
            {result.advice.map((item, i) => (
              <div key={i} className={`relative pl-6 border-l-4 ${i % 2 === 0 ? 'border-primary-container' : 'border-secondary-container'}`}>
                <p className="text-sm text-secondary font-bold mb-1">{item.category}</p>
                <p className="text-on-surface font-medium">{item.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-surface-container-low rounded-3xl p-8 shadow-inner">
        <h3 className="font-sans font-bold text-xl mb-6">生物指标细分</h3>
        <div className="space-y-8">
          {result.metrics.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">{item.label}</span>
                <span className={`font-bold ${i % 3 === 0 ? 'text-primary' : i % 3 === 1 ? 'text-secondary' : 'text-tertiary'}`}>{item.status}</span>
              </div>
              <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  className={`h-full rounded-full ${i % 3 === 0 ? 'bg-primary' : i % 3 === 1 ? 'bg-secondary' : 'bg-tertiary'}`} 
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-4 pb-12">
        <button 
          onClick={onFinish}
          className="w-full h-16 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg rounded-full shadow-[0_8px_24px_rgba(57,104,70,0.15)] active:scale-95 transition-transform"
        >
          完成
        </button>
        <button className="w-full h-16 bg-surface-container-high text-on-surface font-bold text-lg rounded-full active:scale-95 transition-transform">
          保存至记录本
        </button>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [records, setRecords] = useState<StoolRecord[]>(() => {
    const saved = localStorage.getItem('gut_health_records');
    return saved ? JSON.parse(saved) : [];
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showApiModal, setShowApiModal] = useState(false);
  const [providers, setProviders] = useState<ApiProvider[]>(() => {
    const saved = localStorage.getItem('gut_health_providers');
    if (saved) return JSON.parse(saved);
    
    // Default Gemini provider if none exists
    return [{
      id: 'default-gemini',
      name: 'Google Gemini (Default)',
      type: 'Gemini',
      baseUrl: '',
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-3.1-flash-lite-preview',
      isActive: true
    }];
  });
  const [activeProviderId, setActiveProviderId] = useState<string>(() => {
    const saved = localStorage.getItem('gut_health_active_provider_id');
    return saved || 'default-gemini';
  });

  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [newProvider, setNewProvider] = useState<Partial<ApiProvider>>({
    type: 'Gemini',
    name: '',
    baseUrl: '',
    apiKey: '',
    model: 'gemini-3.1-flash-lite-preview'
  });

  useEffect(() => {
    localStorage.setItem('gut_health_providers', JSON.stringify(providers));
    localStorage.setItem('gut_health_active_provider_id', activeProviderId);
  }, [providers, activeProviderId]);

  useEffect(() => {
    if (providers.length === 1 && !providers[0].apiKey && !process.env.GEMINI_API_KEY) {
      setShowApiModal(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gut_health_records', JSON.stringify(records));
  }, [records]);

  const handleFinishRecord = (record: StoolRecord) => {
    setRecords([record, ...records]);
    setScreen('home');
  };

  const handleAnalyze = async (image: string) => {
    const activeProvider = providers.find(p => p.id === activeProviderId) || providers[0];
    if (!activeProvider || !activeProvider.apiKey) {
      setShowApiModal(true);
      return;
    }

    try {
      const result = await analyzeStoolImage(image, activeProvider);
      setAnalysisResult(result);
      setScreen('analysis');
    } catch (error: any) {
      console.error("Analysis failed:", error);
      const errorMessage = error?.message || "未知错误";
      alert(`AI 分析失败: ${errorMessage}\n\n请检查 API Key 是否正确、模型是否支持视觉功能，或网络连接是否正常。`);
    }
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <HomeScreen records={records} onStartRecord={() => setScreen('record')} onDeleteRecord={handleDeleteRecord} />;
      case 'record': return <RecordScreen onFinish={handleFinishRecord} onAnalyze={handleAnalyze} />;
      case 'academy': return <AcademyScreen />;
      case 'report': return <ReportScreen records={records} />;
      case 'profile': return <ProfileScreen records={records} onOpenApiSettings={() => setShowApiModal(true)} />;
      case 'analysis': return <AnalysisScreen result={analysisResult} onFinish={() => setScreen('home')} />;
      default: return <HomeScreen records={records} onStartRecord={() => setScreen('record')} onDeleteRecord={handleDeleteRecord} />;
    }
  };

  const getTitle = () => {
    switch (screen) {
      case 'home': return '今天拉了吗';
      case 'record': return '快速记录';
      case 'academy': return '拉了学院';
      case 'report': return '健康报告';
      case 'profile': return '个人中心';
      case 'analysis': return 'AI 自动分析';
      default: return '今天拉了吗';
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body selection:bg-primary-container">
      <Header 
        title={getTitle()} 
        showBack={screen === 'record' || screen === 'analysis'} 
        onBack={() => setScreen('home')} 
      />
      
      <main className="flex-1 overflow-y-auto hide-scrollbar">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </main>

      {screen !== 'record' && screen !== 'analysis' && (
        <BottomNav currentScreen={screen} setScreen={setScreen} />
      )}

      {/* API Setup Modal */}
      <AnimatePresence>
        {showApiModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-on-background/40 backdrop-blur-md"
              onClick={() => {
                if (!isAddingProvider) setShowApiModal(false);
              }}
            />
            <motion.main 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col border border-outline-variant/20 max-h-[90vh]"
            >
              {!isAddingProvider ? (
                <>
                  <div className="p-8 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-lowest">
                    <div>
                      <h1 className="font-sans font-black text-2xl text-primary tracking-tight">
                        API Providers
                      </h1>
                      <p className="text-on-surface-variant text-sm mt-1">
                        Manage API providers for AI analysis. The active provider will be used for all sessions.
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setNewProvider({
                          type: 'Gemini',
                          name: '',
                          baseUrl: '',
                          apiKey: '',
                          model: 'gemini-3.1-flash-lite-preview'
                        });
                        setIsAddingProvider(true);
                      }}
                      className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full font-bold text-sm shadow-sm hover:bg-primary/90 transition-colors"
                    >
                      <Plus size={18} />
                      Add Provider
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-container-low/30">
                    {providers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-surface-container-high rounded-3xl flex items-center justify-center text-outline-variant">
                          <Settings size={40} />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">No providers configured</p>
                          <p className="text-sm text-on-surface-variant">Add a provider to use AI analysis features.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 pt-4">
                          {['Gemini', 'Moonshot', 'OpenAI', 'Custom'].map(type => (
                            <button 
                              key={type}
                              onClick={() => {
                                let defaultModel = 'gemini-3.1-flash-lite-preview';
                                let defaultBaseUrl = '';
                                if (type === 'Moonshot') {
                                  defaultModel = 'kimi-k2.5';
                                  defaultBaseUrl = 'https://api.moonshot.cn/v1';
                                } else if (type === 'OpenAI') {
                                  defaultModel = 'gpt-4o-mini';
                                  defaultBaseUrl = 'https://api.openai.com/v1';
                                }
                                setNewProvider({ type: type as ProviderType, name: `${type} Provider`, model: defaultModel, baseUrl: defaultBaseUrl, apiKey: '' });
                                setIsAddingProvider(true);
                              }}
                              className="px-3 py-1.5 rounded-full border border-outline-variant text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-1"
                            >
                              <Plus size={12} />
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      providers.map(provider => (
                        <div 
                          key={provider.id}
                          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                            activeProviderId === provider.id 
                              ? 'border-primary bg-primary/5 shadow-md' 
                              : 'border-outline-variant/30 bg-white hover:border-primary/50'
                          }`}
                          onClick={() => setActiveProviderId(provider.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                              activeProviderId === provider.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-primary'
                            }`}>
                              {provider.type === 'Gemini' ? <Zap size={24} /> : <BookOpen size={24} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-on-surface">{provider.name}</h3>
                                {activeProviderId === provider.id && (
                                  <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Active</span>
                                )}
                              </div>
                              <p className="text-xs text-on-surface-variant font-medium">
                                {provider.type} · {provider.model}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setProviders(providers.filter(p => p.id !== provider.id));
                                if (activeProviderId === provider.id && providers.length > 1) {
                                  setActiveProviderId(providers.find(p => p.id !== provider.id)!.id);
                                }
                              }}
                              className="p-2 text-outline-variant hover:text-tertiary transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                            {activeProviderId === provider.id ? (
                              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center">
                                <Check size={18} />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full border-2 border-outline-variant/30" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-6 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-lowest">
                    <button 
                      onClick={() => setShowApiModal(false)}
                      className="px-6 py-3 rounded-full font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-sans font-black text-2xl text-on-surface tracking-tight">Add Provider</h2>
                      <p className="text-on-surface-variant text-sm mt-1">Configure a new AI provider for analysis.</p>
                    </div>
                    <button 
                      onClick={() => setIsAddingProvider(false)}
                      className="p-2 hover:bg-surface-container rounded-full transition-colors"
                    >
                      <Plus size={24} className="rotate-45 text-on-surface-variant" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-on-surface-variant ml-1">Name</label>
                      <input 
                        value={newProvider.name}
                        onChange={e => setNewProvider({ ...newProvider, name: e.target.value })}
                        placeholder="My API Provider"
                        className="w-full h-14 px-5 rounded-2xl bg-surface-container-low border-2 border-transparent focus:border-primary/30 focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-on-surface-variant ml-1">Provider Type</label>
                      <select 
                        value={newProvider.type}
                        onChange={e => {
                          const type = e.target.value as ProviderType;
                          let defaultModel = newProvider.model;
                          let defaultBaseUrl = newProvider.baseUrl;
                          if (type === 'Gemini') {
                            defaultModel = 'gemini-3.1-flash-lite-preview';
                            defaultBaseUrl = '';
                          } else if (type === 'Moonshot') {
                            defaultModel = 'kimi-k2.5';
                            defaultBaseUrl = 'https://api.moonshot.cn/v1';
                          } else if (type === 'OpenAI') {
                            defaultModel = 'gpt-4o-mini';
                            defaultBaseUrl = 'https://api.openai.com/v1';
                          }
                          setNewProvider({ ...newProvider, type, model: defaultModel, baseUrl: defaultBaseUrl });
                        }}
                        className="w-full h-14 px-5 rounded-2xl bg-surface-container-low border-2 border-transparent focus:border-primary/30 focus:bg-white transition-all font-medium appearance-none"
                      >
                        <option value="Gemini">Gemini</option>
                        <option value="Moonshot">Moonshot (Kimi)</option>
                        <option value="OpenAI">OpenAI</option>
                        <option value="Custom">Custom (OpenAI Compatible)</option>
                      </select>
                    </div>

                    {newProvider.type !== 'Gemini' && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-on-surface-variant ml-1">API Base URL</label>
                        <input 
                          value={newProvider.baseUrl}
                          onChange={e => setNewProvider({ ...newProvider, baseUrl: e.target.value })}
                          placeholder="https://api.example.com/v1"
                          className="w-full h-14 px-5 rounded-2xl bg-surface-container-low border-2 border-transparent focus:border-primary/30 focus:bg-white transition-all font-medium"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-on-surface-variant ml-1">API Key</label>
                      <input 
                        type="password"
                        value={newProvider.apiKey}
                        onChange={e => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                        placeholder="sk-..."
                        className="w-full h-14 px-5 rounded-2xl bg-surface-container-low border-2 border-transparent focus:border-primary/30 focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-on-surface-variant ml-1">Model Name</label>
                      <input 
                        value={newProvider.model}
                        onChange={e => setNewProvider({ ...newProvider, model: e.target.value })}
                        placeholder="gemini-3.1-flash-lite-preview"
                        className="w-full h-14 px-5 rounded-2xl bg-surface-container-low border-2 border-transparent focus:border-primary/30 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button 
                      onClick={() => setIsAddingProvider(false)}
                      className="px-6 py-3 rounded-full font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        if (!newProvider.name || !newProvider.apiKey) {
                          alert('Please fill in Name and API Key');
                          return;
                        }
                        const id = Math.random().toString(36).substr(2, 9);
                        const provider: ApiProvider = {
                          id,
                          name: newProvider.name!,
                          type: newProvider.type!,
                          baseUrl: newProvider.baseUrl || '',
                          apiKey: newProvider.apiKey!,
                          model: newProvider.model || '',
                          isActive: false
                        };
                        setProviders([...providers, provider]);
                        setActiveProviderId(id);
                        setIsAddingProvider(false);
                      }}
                      className="px-8 py-3 rounded-full bg-primary text-on-primary font-bold shadow-lg hover:bg-primary/90 transition-all active:scale-95"
                    >
                      Add Provider
                    </button>
                  </div>
                </div>
              )}
            </motion.main>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
