import { Link, useLocation } from "wouter";
import { Upload, Search, FileText, Edit, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentStep: number;
}

export function Sidebar({ currentStep }: SidebarProps) {
  const [location] = useLocation();

  const workflowItems = [
    { icon: Upload, label: "Upload Documents", step: 1 },
    { icon: Search, label: "Extract Information", step: 2 },
    { icon: FileText, label: "Select Template", step: 3 },
    { icon: Edit, label: "Generate Document", step: 4 },
    { icon: Download, label: "Download & File", step: 5 },
  ];

  const recentProjects = [
    { title: "Smith vs. Johnson", subtitle: "Motion to Dismiss" },
    { title: "Estate of Brown", subtitle: "Petition for Probate" },
  ];

  return (
    <nav className="w-64 bg-white border-r border-gray-200 px-4 py-6" data-testid="sidebar">
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Workflow
          </h3>
          <ul className="space-y-2">
            {workflowItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentStep === item.step;
              const isCompleted = currentStep > item.step;
              
              return (
                <li key={item.step}>
                  <button
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors",
                      isActive
                        ? "text-white bg-legal-blue"
                        : isCompleted
                        ? "text-legal-blue bg-blue-50 hover:bg-blue-100"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    data-testid={`workflow-step-${item.step}`}
                  >
                    <Icon className="mr-3 text-sm w-4 h-4" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Recent Projects
          </h3>
          <ul className="space-y-2">
            {recentProjects.map((project, index) => (
              <li key={index}>
                <button 
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md w-full text-left"
                  data-testid={`recent-project-${index}`}
                >
                  <div className="font-medium">{project.title}</div>
                  <div className="text-xs text-gray-500">{project.subtitle}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
