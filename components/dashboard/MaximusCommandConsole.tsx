// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: Date;
  type?: "command" | "analysis" | "alert" | "insight";
  metadata?: {
    confidence?: number;
    sources?: string[];
    actions?: string[];
  };
}

interface Command {
  id: string;
  phrase: string;
  description: string;
  category: string;
  icon: string;
}

export default function MaximusCommandConsole() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      text: "MAXIMUS Command Console initialized. Ready for analysis.",
      timestamp: new Date(),
      type: "system"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "commands" | "analytics">("chat");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: "help", phrase: "/help", description: "Show available commands", category: "system", icon: "❓" },
    { id: "drivers", phrase: "/drivers", description: "Analyze performance drivers", category: "analysis", icon: "📊" },
    { id: "risk", phrase: "/risk", description: "Risk assessment and alerts", category: "analysis", icon: "⚠️" },
    { id: "actions", phrase: "/actions", description: "Recommended actions", category: "action", icon: "🎯" },
    { id: "forecast", phrase: "/forecast", description: "Revenue forecasting", category: "prediction", icon: "🔮" },
    { id: "competitors", phrase: "/competitors", description: "Competitor analysis", category: "analysis", icon: "🏆" },
    { id: "optimize", phrase: "/optimize", description: "Optimization suggestions", category: "action", icon: "⚡" },
    { id: "export", phrase: "/export", description: "Export data and reports", category: "system", icon: "📤" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const submitQuery = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    const userMessage: Message = {
      role: "user",
      text: prompt,
      timestamp: new Date(),
      type: "command"
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCommandHistory(prev => [...prev, prompt]);
    setHistoryIndex(-1);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/console/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        text: data.answer || "No answer available",
        timestamp: new Date(),
        type: "analysis",
        metadata: {
          confidence: 0.85,
          sources: ["DTRI Analytics", "Market Data", "Performance Metrics"],
          actions: ["View Details", "Export Report", "Set Alert"]
        }
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        text: "Error: Unable to process request. Please try again.",
        timestamp: new Date(),
        type: "alert"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitQuery(query);
    } else if (e.key === "ArrowUp" && commandHistory.length > 0) {
      e.preventDefault();
      const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setQuery(commandHistory[newIndex]);
    } else if (e.key === "ArrowDown" && historyIndex !== -1) {
      e.preventDefault();
      const newIndex = historyIndex + 1;
      if (newIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setQuery("");
      } else {
        setHistoryIndex(newIndex);
        setQuery(commandHistory[newIndex]);
      }
    }
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    }
  };

  const getMessageIcon = (message: Message) => {
    switch (message.type) {
      case "command": return "💬";
      case "analysis": return "🧠";
      case "alert": return "⚠️";
      case "insight": return "💡";
      default: return message.role === "user" ? "👤" : "🤖";
    }
  };

  const getMessageColor = (message: Message) => {
    switch (message.type) {
      case "command": return "text-gray-800";
      case "analysis": return "text-blue-700";
      case "alert": return "text-red-600";
      case "insight": return "text-green-600";
      default: return message.role === "user" ? "text-gray-800" : "text-blue-700";
    }
  };

  return React.createElement("div", {
    className: "border border-gray-200 rounded-2xl bg-white/90 backdrop-blur-xl ring-1 ring-gray-900/5 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
  }, [
    // Header with tabs
    React.createElement("div", {
      key: "header",
      className: "flex items-center justify-between mb-6"
    }, [
      React.createElement("div", {
        key: "title-section",
        className: "flex items-center gap-3"
      }, [
        React.createElement("div", {
          key: "icon",
          className: "w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm"
        }, "M"),
        React.createElement("div", {
          key: "title-text"
        }, [
          React.createElement("h3", {
            key: "title",
            className: "text-lg font-semibold text-gray-900"
          }, "MAXIMUS Command Console"),
          React.createElement("p", {
            key: "subtitle",
            className: "text-xs text-gray-500"
          }, "AI-Powered Analytics & Intelligence")
        ])
      ]),
      React.createElement("div", {
        key: "tabs",
        className: "flex gap-1 bg-gray-100 rounded-lg p-1"
      }, [
        ["chat", "💬"], ["commands", "⚡"], ["analytics", "📊"]
      ].map(([tab, icon]) => 
        React.createElement("button", {
          key: tab,
          onClick: () => setActiveTab(tab as any),
          className: `px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            activeTab === tab 
              ? "bg-white text-gray-900 shadow-sm" 
              : "text-gray-600 hover:text-gray-900"
          }`
        }, `${icon} ${tab}`)
      ))
    ]),

    // Content based on active tab
    activeTab === "chat" && React.createElement("div", {
      key: "chat-content"
    }, [
      // Messages area
      React.createElement("div", {
        key: "messages",
        className: "h-80 overflow-y-auto bg-gradient-to-b from-gray-50 to-white rounded-xl p-4 mb-4 border border-gray-100"
      }, [
        ...messages.map((message, index) => 
          React.createElement("div", {
            key: index,
            className: `flex items-start gap-3 mb-4 ${getMessageColor(message)}`
          }, [
            React.createElement("div", {
              key: "icon",
              className: "w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
            }, getMessageIcon(message)),
            React.createElement("div", {
              key: "content",
              className: "flex-1"
            }, [
              React.createElement("div", {
                key: "header",
                className: "flex items-center gap-2 mb-1"
              }, [
                React.createElement("span", {
                  key: "role",
                  className: "font-semibold text-sm"
                }, message.role === "user" ? "You" : "MAXIMUS"),
                React.createElement("span", {
                  key: "time",
                  className: "text-xs text-gray-400"
                }, message.timestamp.toLocaleTimeString())
              ]),
              React.createElement("div", {
                key: "text",
                className: "text-sm leading-relaxed"
              }, message.text),
              message.metadata && React.createElement("div", {
                key: "metadata",
                className: "mt-2 flex flex-wrap gap-2"
              }, [
                message.metadata.confidence && React.createElement("span", {
                  key: "confidence",
                  className: "px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                }, `Confidence: ${Math.round(message.metadata.confidence * 100)}%`),
                ...(message.metadata.actions || []).map((action, i) =>
                  React.createElement("button", {
                    key: `action-${i}`,
                    className: "px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs transition-colors"
                  }, action)
                )
              ])
            ])
          ])
        ),
        isLoading && React.createElement("div", {
          key: "loading",
          className: "flex items-center gap-3 text-blue-600"
        }, [
          React.createElement("div", {
            key: "loading-icon",
            className: "w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs"
          }, "🤖"),
          React.createElement("div", {
            key: "loading-text",
            className: "flex items-center gap-2"
          }, [
            React.createElement("span", {
              key: "text",
              className: "text-sm"
            }, "MAXIMUS: Analyzing data"),
            React.createElement("div", {
              key: "dots",
              className: "flex gap-1"
            }, [1,2,3].map(i => 
              React.createElement("div", {
                key: i,
                className: "w-1 h-1 bg-blue-600 rounded-full animate-pulse",
                style: { animationDelay: `${i * 0.2}s` }
              })
            ))
          ])
        ]),
        React.createElement("div", {
          key: "scroll-anchor",
          ref: messagesEndRef
        })
      ]),

      // Input area
      React.createElement("div", {
        key: "input",
        className: "flex gap-2"
      }, [
        React.createElement("input", {
          key: "query-input",
          ref: inputRef,
          value: query,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
          onKeyDown: handleKeyPress,
          placeholder: 'Ask: "what drove yesterday\'s $ drop?" or try a command...',
          className: "flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
          disabled: isLoading
        }),
        React.createElement("button", {
          key: "voice-button",
          onClick: startVoiceRecognition,
          disabled: isLoading || isListening,
          className: `px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
            isListening 
              ? "bg-red-500 text-white animate-pulse" 
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`
        }, isListening ? "🎤" : "🎤"),
        React.createElement("button", {
          key: "submit-button",
          onClick: () => submitQuery(query),
          disabled: isLoading || !query.trim(),
          className: "px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        }, isLoading ? "..." : "Send")
      ])
    ]),

    activeTab === "commands" && React.createElement("div", {
      key: "commands-content",
      className: "h-80 overflow-y-auto"
    }, [
      React.createElement("div", {
        key: "commands-grid",
        className: "grid grid-cols-2 gap-3"
      }, commands.map(command => 
        React.createElement("button", {
          key: command.id,
          onClick: () => {
            setQuery(command.phrase);
            setActiveTab("chat");
            inputRef.current?.focus();
          },
          className: "p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all text-left group"
        }, [
          React.createElement("div", {
            key: "header",
            className: "flex items-center gap-3 mb-2"
          }, [
            React.createElement("span", {
              key: "icon",
              className: "text-lg"
            }, command.icon),
            React.createElement("span", {
              key: "phrase",
              className: "font-mono text-sm font-semibold text-gray-900"
            }, command.phrase)
          ]),
          React.createElement("p", {
            key: "description",
            className: "text-xs text-gray-600 group-hover:text-gray-800"
          }, command.description),
          React.createElement("span", {
            key: "category",
            className: "inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
          }, command.category)
        ])
      ))
    ]),

    activeTab === "analytics" && React.createElement("div", {
      key: "analytics-content",
      className: "h-80 overflow-y-auto"
    }, [
      React.createElement("div", {
        key: "analytics-grid",
        className: "grid grid-cols-2 gap-4"
      }, [
        React.createElement("div", {
          key: "quick-stats",
          className: "col-span-2 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
        }, [
          React.createElement("h4", {
            key: "title",
            className: "font-semibold text-gray-900 mb-3"
          }, "Quick Analytics"),
          React.createElement("div", {
            key: "stats",
            className: "grid grid-cols-3 gap-4"
          }, [
            { label: "Queries Today", value: "47", trend: "+12%" },
            { label: "Avg Response", value: "1.2s", trend: "-0.3s" },
            { label: "Accuracy", value: "94.2%", trend: "+2.1%" }
          ].map((stat, i) => 
            React.createElement("div", {
              key: i,
              className: "text-center"
            }, [
              React.createElement("div", {
                key: "value",
                className: "text-lg font-bold text-gray-900"
              }, stat.value),
              React.createElement("div", {
                key: "label",
                className: "text-xs text-gray-600"
              }, stat.label),
              React.createElement("div", {
                key: "trend",
                className: "text-xs text-green-600"
              }, stat.trend)
            ])
          ))
        ]),
        React.createElement("div", {
          key: "recent-commands",
          className: "p-4 bg-white border border-gray-200 rounded-xl"
        }, [
          React.createElement("h4", {
            key: "title",
            className: "font-semibold text-gray-900 mb-3"
          }, "Recent Commands"),
          React.createElement("div", {
            key: "list",
            className: "space-y-2"
          }, commandHistory.slice(-5).reverse().map((cmd, i) => 
            React.createElement("div", {
              key: i,
              className: "text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded"
            }, cmd)
          ))
        ]),
        React.createElement("div", {
          key: "system-status",
          className: "p-4 bg-white border border-gray-200 rounded-xl"
        }, [
          React.createElement("h4", {
            key: "title",
            className: "font-semibold text-gray-900 mb-3"
          }, "System Status"),
          React.createElement("div", {
            key: "status-list",
            className: "space-y-2"
          }, [
            { label: "API Health", status: "Healthy", color: "green" },
            { label: "Data Sources", status: "Connected", color: "green" },
            { label: "AI Models", status: "Active", color: "green" }
          ].map((item, i) => 
            React.createElement("div", {
              key: i,
              className: "flex justify-between items-center"
            }, [
              React.createElement("span", {
                key: "label",
                className: "text-sm text-gray-600"
              }, item.label),
              React.createElement("span", {
                key: "status",
                className: `text-xs px-2 py-1 rounded-full ${
                  item.color === "green" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`
              }, item.status)
            ])
          ))
        ])
      ])
    ])
  ]);
}