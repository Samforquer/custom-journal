import React, { useState, useRef, useEffect } from 'react';
import { Settings, Save, FileText, Trash2 } from 'lucide-react';

const FONTS = [
  { name: 'Indie Flower', value: "'Indie Flower', cursive" },
  { name: 'Caveat', value: "'Caveat', cursive" },
  { name: 'Permanent Marker', value: "'Permanent Marker', cursive" },
  { name: 'Shadows Into Light', value: "'Shadows Into Light', cursive" },
  { name: 'Kalam', value: "'Kalam', cursive" },
  { name: 'Patrick Hand', value: "'Patrick Hand', cursive" },
];

const PAPER_PATTERNS = [
  { name: 'Blank', value: 'blank' },
  { name: 'Lined', value: 'lined' },
  { name: 'Dotted', value: 'dotted' },
  { name: 'Grid', value: 'grid' },
  { name: 'College Ruled', value: 'college' },
];

export default function JournalApp() {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  const [settings, setSettings] = useState({
    paperColor: '#fdfbf5',
    pattern: 'lined',
    lineColor: '#d4c5b9',
    lineWidth: 1,
    lineSpacing: 32,
    font: FONTS[0].value,
    fontSize: 18,
    textColor: '#2c2416',
  });

  const canvasRef = useRef(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Indie+Flower&family=Caveat:wght@400;700&family=Permanent+Marker&family=Shadows+Into+Light&family=Kalam:wght@300;400;700&family=Patrick+Hand&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    drawPattern();
  }, [settings]);

  const drawPattern = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = settings.paperColor;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = settings.lineColor;
    ctx.lineWidth = settings.lineWidth;

    switch (settings.pattern) {
      case 'lined':
      case 'college':
        const spacing = settings.pattern === 'college' ? 24 : settings.lineSpacing;
        for (let y = spacing; y < height; y += spacing) {
          ctx.beginPath();
          ctx.moveTo(60, y);
          ctx.lineTo(width - 40, y);
          ctx.stroke();
        }
        // Left margin
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, 0);
        ctx.lineTo(50, height);
        ctx.stroke();
        break;

      case 'dotted':
        for (let y = settings.lineSpacing; y < height; y += settings.lineSpacing) {
          for (let x = 40; x < width - 40; x += settings.lineSpacing) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = settings.lineColor;
            ctx.fill();
          }
        }
        break;

      case 'grid':
        for (let y = 0; y < height; y += settings.lineSpacing) {
          ctx.beginPath();
          ctx.moveTo(40, y);
          ctx.lineTo(width - 40, y);
          ctx.stroke();
        }
        for (let x = 40; x < width - 40; x += settings.lineSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        break;

      case 'blank':
      default:
        break;
    }
  };

  const saveEntry = () => {
    if (!currentEntry.trim()) return;
    
    const entry = {
      id: selectedEntry?.id || Date.now(),
      title: currentTitle || `Entry ${entries.length + 1}`,
      content: currentEntry,
      date: new Date().toISOString(),
      settings: { ...settings },
    };

    if (selectedEntry) {
      setEntries(entries.map(e => e.id === selectedEntry.id ? entry : e));
    } else {
      setEntries([entry, ...entries]);
    }

    setCurrentEntry('');
    setCurrentTitle('');
    setSelectedEntry(null);
  };

  const loadEntry = (entry) => {
    setSelectedEntry(entry);
    setCurrentTitle(entry.title);
    setCurrentEntry(entry.content);
    setSettings(entry.settings);
  };

  const deleteEntry = (id) => {
    setEntries(entries.filter(e => e.id !== id));
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
      setCurrentEntry('');
      setCurrentTitle('');
    }
  };

  const newEntry = () => {
    setSelectedEntry(null);
    setCurrentEntry('');
    setCurrentTitle('');
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <link href="https://fonts.googleapis.com/css2?family=Indie+Flower&family=Caveat:wght@400;700&family=Permanent+Marker&family=Shadows+Into+Light&family=Kalam:wght@300;400;700&family=Patrick+Hand&display=swap" rel="stylesheet" />
      
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold mb-4">My Journal</h1>
          <button
            onClick={newEntry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <FileText size={18} />
            New Entry
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {entries.length === 0 ? (
            <p className="text-gray-400 text-center mt-8">No entries yet</p>
          ) : (
            entries.map(entry => (
              <div
                key={entry.id}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  selectedEntry?.id === entry.id
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => loadEntry(entry)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold truncate flex-1">{entry.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEntry(entry.id);
                    }}
                    className="text-red-400 hover:text-red-300 ml-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(entry.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                  {entry.content.substring(0, 80)}...
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <input
            type="text"
            placeholder="Entry Title..."
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Settings size={20} />
            </button>
            <button
              onClick={saveEntry}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <Save size={18} />
              Save
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Writing Area */}
          <div className="flex-1 overflow-y-auto p-8 flex justify-center">
            <div className="relative" style={{ width: '800px' }}>
              <canvas
                ref={canvasRef}
                width={800}
                height={1000}
                className="absolute top-0 left-0 shadow-2xl"
              />
              <textarea
                value={currentEntry}
                onChange={(e) => setCurrentEntry(e.target.value)}
                placeholder="Start writing..."
                className="relative bg-transparent w-full h-full resize-none focus:outline-none"
                style={{
                  minHeight: '1000px',
                  padding: settings.pattern === 'lined' || settings.pattern === 'college' ? '0 40px 0 70px' : '0 40px',
                  paddingTop: settings.pattern === 'college' ? '24px' : `${settings.lineSpacing}px`,
                  lineHeight: settings.pattern === 'college' ? '24px' : `${settings.lineSpacing}px`,
                  fontFamily: settings.font,
                  fontSize: `${settings.fontSize}px`,
                  color: settings.textColor,
                }}
              />
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">Customization</h2>

              <div className="space-y-6">
                {/* Font Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Font</label>
                  <select
                    value={settings.font}
                    onChange={(e) => setSettings({ ...settings, font: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {FONTS.map(font => (
                      <option key={font.value} value={font.value}>{font.name}</option>
                    ))}
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Font Size: {settings.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    value={settings.fontSize}
                    onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">Text Color</label>
                  <input
                    type="color"
                    value={settings.textColor}
                    onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Paper Pattern */}
                <div>
                  <label className="block text-sm font-medium mb-2">Paper Pattern</label>
                  <select
                    value={settings.pattern}
                    onChange={(e) => setSettings({ ...settings, pattern: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PAPER_PATTERNS.map(pattern => (
                      <option key={pattern.value} value={pattern.value}>{pattern.name}</option>
                    ))}
                  </select>
                </div>

                {/* Paper Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">Paper Color</label>
                  <input
                    type="color"
                    value={settings.paperColor}
                    onChange={(e) => setSettings({ ...settings, paperColor: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Line Color */}
                {settings.pattern !== 'blank' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Line Color</label>
                    <input
                      type="color"
                      value={settings.lineColor}
                      onChange={(e) => setSettings({ ...settings, lineColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                )}

                {/* Line Width */}
                {settings.pattern !== 'blank' && settings.pattern !== 'dotted' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Line Width: {settings.lineWidth}px
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.5"
                      value={settings.lineWidth}
                      onChange={(e) => setSettings({ ...settings, lineWidth: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Line Spacing */}
                {settings.pattern !== 'blank' && settings.pattern !== 'college' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Line Spacing: {settings.lineSpacing}px
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="50"
                      value={settings.lineSpacing}
                      onChange={(e) => setSettings({ ...settings, lineSpacing: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}