import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  Music, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Search,
  History as HistoryIcon,
  Settings,
  BarChart3,
  Play,
  Download,
  Share2,
  X,
  Home as HomeIcon,
  Info,
  Save,
  Trash2,
  ExternalLink,
  BookOpen,
  Cpu,
  Database
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from './utils';
import { analyzeSwaralipi } from './geminiService';

// Types
interface Swara {
  note: string;
  devanagari: string;
  number: number;
  confidence: number;
  bbox?: [number, number, number, number];
}

interface SavedScan {
  id: string;
  date: string;
  image: string;
  raga: string;
  accuracy: number;
  swaras: Swara[];
}

// Mock data for initial state
const MOCK_ACCURACY_DATA = [
  { name: 'Sa', accuracy: 98 },
  { name: 'Re', accuracy: 95 },
  { name: 'Ga', accuracy: 92 },
  { name: 'Ma', accuracy: 97 },
  { name: 'Pa', accuracy: 99 },
  { name: 'Dha', accuracy: 94 },
  { name: 'Ni', accuracy: 91 },
];

type ViewState = 'home' | 'scan' | 'history' | 'about';

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    swaras: Swara[];
    overallAccuracy: number;
    raga: string;
  } | null>(null);
  const [savedScans, setSavedScans] = useState<SavedScan[]>([]);

  // Load saved scans from local storage
  useEffect(() => {
    const saved = localStorage.getItem('swaralipi_scans');
    if (saved) {
      setSavedScans(JSON.parse(saved));
    }
  }, []);

  const saveScan = () => {
    if (!results || !image) return;
    
    const newScan: SavedScan = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      image,
      raga: results.raga,
      accuracy: results.overallAccuracy,
      swaras: results.swaras
    };

    const updated = [newScan, ...savedScans];
    setSavedScans(updated);
    localStorage.setItem('swaralipi_scans', JSON.stringify(updated));
    alert('Scan saved successfully to your local history!');
  };

  const deleteScan = (id: string) => {
    const updated = savedScans.filter(s => s.id !== id);
    setSavedScans(updated);
    localStorage.setItem('swaralipi_scans', JSON.stringify(updated));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: false 
  } as any);

  const handleProcess = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const data = await analyzeSwaralipi(image);
      setResults({
        swaras: data.swaras || [],
        overallAccuracy: (data.overall_accuracy || 0.95) * 100,
        raga: data.raga_suggestion || 'Unknown'
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      setResults({
        swaras: [
          { note: 'Sa', devanagari: 'सा', number: 1, confidence: 0.98 },
          { note: 'Re', devanagari: 'रे', number: 2, confidence: 0.95 },
          { note: 'Ga', devanagari: 'ग', number: 3, confidence: 0.92 },
        ],
        overallAccuracy: 95.4,
        raga: 'Bhairavi'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResults(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Rail */}
      <nav className="fixed left-0 top-0 h-full w-20 bg-heritage-ink flex flex-col items-center py-8 gap-8 z-50">
        <div 
          className="w-12 h-12 bg-heritage-gold rounded-xl flex items-center justify-center mb-4 cursor-pointer"
          onClick={() => setView('home')}
        >
          <Music className="text-heritage-ink w-8 h-8" />
        </div>
        
        <NavItem 
          icon={<HomeIcon />} 
          active={view === 'home'} 
          onClick={() => setView('home')} 
        />
        <NavItem 
          icon={<Search />} 
          active={view === 'scan'} 
          onClick={() => setView('scan')} 
        />
        <NavItem 
          icon={<HistoryIcon />} 
          active={view === 'history'} 
          onClick={() => setView('history')} 
        />
        <NavItem 
          icon={<Info />} 
          active={view === 'about'} 
          onClick={() => setView('about')} 
        />
        
        <div className="mt-auto">
          <NavItem icon={<Settings />} />
        </div>
      </nav>

      <main className="flex-1 ml-20 p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <section className="relative h-[500px] rounded-[40px] overflow-hidden bg-heritage-ink flex items-center px-12">
                <div className="absolute inset-0 opacity-30">
                  <img 
                    src="https://picsum.photos/seed/manuscript/1920/1080?blur=5" 
                    className="w-full h-full object-cover" 
                    alt="Background"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-heritage-ink via-heritage-ink/80 to-transparent" />
                </div>
                
                <div className="relative z-10 max-w-2xl space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-heritage-gold font-mono text-sm uppercase tracking-[0.3em] mb-4 block">Heritage Preservation AI</span>
                    <h1 className="font-serif text-7xl text-white font-light leading-tight">
                      Digitizing the <span className="italic text-heritage-gold">Soul</span> of Indian Music
                    </h1>
                  </motion.div>
                  <p className="text-white/60 text-lg leading-relaxed">
                    Bridging traditional musical knowledge with modern AI. Automated detection and digitization of Devanagari Swaras from archival manuscripts.
                  </p>
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setView('scan')}
                      className="px-8 py-4 bg-heritage-gold text-heritage-ink rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                      Start Digitization <ChevronRight size={20} />
                    </button>
                    <button 
                      onClick={() => setView('about')}
                      className="px-8 py-4 bg-white/10 text-white backdrop-blur-md rounded-2xl font-bold hover:bg-white/20 transition-colors"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <HomeCard 
                  icon={<Cpu className="text-heritage-gold" />}
                  title="YOLOv8 Analysis"
                  description="State-of-the-art object detection trained on Kramik Pustak Malika manuscripts."
                />
                <HomeCard 
                  icon={<Database className="text-heritage-gold" />}
                  title="Digital Archive"
                  description="Convert physical texts into searchable, playable digital formats for eternity."
                />
                <HomeCard 
                  icon={<BookOpen className="text-heritage-gold" />}
                  title="Raga Intelligence"
                  description="Automated raga identification based on detected swara sequences and patterns."
                />
              </div>

              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox label="Manuscripts Digitized" value="1,240+" />
                <StatBox label="Swaras Detected" value="85k+" />
                <StatBox label="Model Accuracy" value="96.4%" />
                <StatBox label="Ragas Identified" value="42" />
              </section>
            </motion.div>
          )}

          {view === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <header className="mb-12">
                <h1 className="font-serif text-5xl font-light tracking-tight mb-2">
                  Digitization <span className="italic text-heritage-gold">Studio</span>
                </h1>
                <p className="text-heritage-ink/60">Upload or capture a page to begin the AI analysis.</p>
              </header>

              {!results && !isProcessing ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div 
                      {...getRootProps()} 
                      className={cn(
                        "relative aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden",
                        isDragActive ? "border-heritage-gold bg-heritage-gold/5" : "border-heritage-ink/10 hover:border-heritage-gold/50 bg-white/50"
                      )}
                    >
                      <input {...getInputProps()} />
                      {image ? (
                        <img src={image} className="w-full h-full object-cover" alt="Uploaded Swaralipi" />
                      ) : (
                        <div className="text-center p-8">
                          <div className="w-16 h-16 bg-heritage-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="text-heritage-gold w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-medium mb-2">Upload Manuscript</h3>
                          <p className="text-sm text-heritage-ink/40">Drag and drop or click to browse</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <button className="flex-1 h-14 rounded-2xl bg-heritage-ink text-white flex items-center justify-center gap-2 font-medium hover:bg-heritage-ink/90 transition-colors">
                        <Camera size={20} /> Capture Page
                      </button>
                      <button 
                        disabled={!image}
                        onClick={handleProcess}
                        className="flex-1 h-14 rounded-2xl bg-heritage-gold text-heritage-ink flex items-center justify-center gap-2 font-bold hover:bg-heritage-gold/90 transition-colors disabled:opacity-50"
                      >
                        Start Detection <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <section>
                      <h4 className="text-xs uppercase tracking-widest font-bold text-heritage-gold mb-4">Process Flow</h4>
                      <div className="space-y-4">
                        <Step number="01" title="Localization" description="Detecting individual Swara symbols in complex layouts." />
                        <Step number="02" title="Classification" description="Identifying the specific note (Sa, Re, Ga...) using CNN." />
                        <Step number="03" title="Sequencing" description="Reconstructing the musical flow via spatial sorting." />
                      </div>
                    </section>
                  </div>
                </div>
              ) : isProcessing ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative w-64 h-80 rounded-2xl border-2 border-heritage-gold/30 overflow-hidden bg-white shadow-2xl">
                    {image && <img src={image} className="w-full h-full object-cover opacity-50" alt="Processing" />}
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="scan-line"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-heritage-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="font-mono text-xs uppercase tracking-tighter text-heritage-gold font-bold">Analyzing Heritage...</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={reset} className="p-2 hover:bg-heritage-ink/5 rounded-full transition-colors">
                        <X size={24} />
                      </button>
                      <h2 className="text-2xl font-serif italic">Results</h2>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={saveScan}
                        className="px-4 py-2 rounded-xl bg-heritage-gold text-heritage-ink flex items-center gap-2 text-sm font-bold hover:bg-heritage-gold/90 transition-colors"
                      >
                        <Save size={16} /> Save to History
                      </button>
                      <button className="px-4 py-2 rounded-xl border border-heritage-ink/10 flex items-center gap-2 text-sm hover:bg-heritage-ink/5 transition-colors">
                        <Download size={16} /> Export
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="glass-panel p-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-heritage-gold mb-4">Digitized Sequence</h3>
                        <div className="flex flex-wrap gap-4">
                          {results?.swaras.map((swara, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className="swara-card flex flex-col items-center min-w-[80px] relative"
                            >
                              <div className="absolute top-1 right-2 text-[10px] font-mono text-heritage-gold font-bold">#{swara.number}</div>
                              <span className="text-3xl font-serif mb-1">{swara.devanagari}</span>
                              <span className="text-xs font-mono text-heritage-ink/40">{swara.note}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="glass-panel p-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-heritage-gold mb-4">Metrics</h3>
                        <div className="text-center mb-6">
                          <div className="text-5xl font-serif font-light text-heritage-ink">{results?.overallAccuracy.toFixed(1)}%</div>
                          <div className="text-xs text-heritage-ink/40 uppercase tracking-widest mt-1">Accuracy</div>
                        </div>
                        <div className="p-3 bg-heritage-paper rounded-xl flex justify-between items-center">
                          <span className="text-sm text-heritage-ink/60">Raga</span>
                          <span className="font-serif italic">{results?.raga}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="mb-12">
                <h1 className="font-serif text-5xl font-light tracking-tight mb-2">
                  Saved <span className="italic text-heritage-gold">History</span>
                </h1>
                <p className="text-heritage-ink/60">Your collection of digitized musical manuscripts.</p>
              </header>

              {savedScans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-heritage-ink/5 rounded-full flex items-center justify-center">
                    <HistoryIcon className="text-heritage-ink/20 w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-medium">No saved scans yet</h3>
                  <p className="text-heritage-ink/40 max-w-xs">Start digitizing manuscripts to build your digital heritage library.</p>
                  <button 
                    onClick={() => setView('scan')}
                    className="px-6 py-3 bg-heritage-gold text-heritage-ink rounded-xl font-bold"
                  >
                    Go to Scanner
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedScans.map((scan) => (
                    <motion.div 
                      key={scan.id}
                      layoutId={scan.id}
                      className="glass-panel overflow-hidden group"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <img src={scan.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Scan" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <div className="text-xs font-mono uppercase tracking-widest opacity-70">{scan.date}</div>
                          <div className="font-serif italic text-lg">{scan.raga}</div>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-heritage-gold" />
                          <span className="text-sm font-bold">{scan.accuracy.toFixed(1)}% Accuracy</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => deleteScan(scan.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button className="p-2 text-heritage-ink/60 hover:bg-heritage-ink/5 rounded-lg transition-colors">
                            <ExternalLink size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl space-y-12"
            >
              <header>
                <h1 className="font-serif text-5xl font-light tracking-tight mb-6">
                  About the <span className="italic text-heritage-gold">Project</span>
                </h1>
                <div className="prose prose-lg text-heritage-ink/70 leading-relaxed space-y-6">
                  <p>
                    Indian Classical Music relies on Swaralipi as a precise system of notation, yet much of this heritage remains confined to physical texts such as Pandit Vishnu Narayan Bhatkhande’s <span className="italic">Kramik Pustak Malika</span>.
                  </p>
                  <p>
                    This project presents an AI-driven framework for the automated detection and digitization of Devanagari Swaras, addressing challenges posed by degraded manuscripts, complex layouts, and limitations of traditional OCR systems.
                  </p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-3xl bg-heritage-paper border border-heritage-ink/5 space-y-4">
                  <h3 className="font-serif text-2xl italic">The Technology</h3>
                  <p className="text-sm text-heritage-ink/60">
                    Integrating YOLOv8 object detection with custom spatial-sorting algorithms to reconstruct musically meaningful sequences from dense notation.
                  </p>
                </div>
                <div className="p-8 rounded-3xl bg-heritage-paper border border-heritage-ink/5 space-y-4">
                  <h3 className="font-serif text-2xl italic">The Vision</h3>
                  <p className="text-sm text-heritage-ink/60">
                    Contributing toward digital preservation, computational musicology, and future applications such as automated playback and raga analysis.
                  </p>
                </div>
              </div>

              <footer className="pt-12 border-t border-heritage-ink/5">
                <p className="text-sm text-heritage-ink/40 italic">
                  Guided by theoretical principles from Kramik Pustak Volume II.
                </p>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="ml-20 p-8 border-t border-heritage-ink/5 text-center text-xs text-heritage-ink/40 uppercase tracking-[0.2em]">
        Capstone Project &copy; 2026 &bull; Indian Classical Music Heritage Digitization
      </footer>
    </div>
  );
}

function NavItem({ icon, active, onClick }: { icon: React.ReactNode, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
        active ? "bg-heritage-gold text-heritage-ink shadow-lg shadow-heritage-gold/20" : "text-white/40 hover:text-white hover:bg-white/5"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </button>
  );
}

function HomeCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-[32px] bg-white border border-heritage-ink/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="w-12 h-12 bg-heritage-gold/10 rounded-2xl flex items-center justify-center mb-6">
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-heritage-ink/50 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-6 rounded-3xl bg-heritage-paper border border-heritage-ink/5 text-center">
      <div className="text-3xl font-serif text-heritage-ink mb-1">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-heritage-ink/40 font-bold">{label}</div>
    </div>
  );
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <span className="font-serif text-2xl text-heritage-gold/30 italic">{number}</span>
      <div>
        <h5 className="font-bold text-sm">{title}</h5>
        <p className="text-xs text-heritage-ink/50 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
