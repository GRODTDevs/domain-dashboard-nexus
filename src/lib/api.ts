import { Domain, DomainFile, DomainLink, DomainNote, DomainStatus, SEOAnalysis } from "@/types/domain";
import { v4 as uuidv4 } from 'uuid';
import { isStorageInitialized } from "./db";

// User types
export type UserRole = "admin" | "user" | "editor" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

// Mock user data
let users: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    active: true,
    createdAt: "2023-01-01T00:00:00Z",
    lastLogin: "2023-04-02T10:30:00Z"
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    active: true,
    createdAt: "2023-02-15T00:00:00Z",
    lastLogin: "2023-04-01T14:22:00Z"
  }
];

// Load domains from localStorage or use default mock data
const loadDomainsFromStorage = (): Domain[] => {
  try {
    const storedDomains = localStorage.getItem('domains');
    if (storedDomains) {
      return JSON.parse(storedDomains);
    }
  } catch (error) {
    console.error("Error loading domains from localStorage:", error);
  }
  
  // Default mock data if nothing in localStorage
  return [
    {
      id: "1",
      name: "example.com",
      registrar: "GoDaddy",
      registeredDate: "2022-01-15",
      expiryDate: "2025-01-15",
      status: "active",
      autoRenew: true,
      nameservers: ["ns1.godaddy.com", "ns2.godaddy.com"],
      notes: [
        {
          id: "n1",
          domainId: "1",
          content: "Main company domain",
          createdAt: "2022-01-15T08:30:00Z",
          updatedAt: "2022-01-15T08:30:00Z",
        }
      ],
      links: [
        {
          id: "l1",
          domainId: "1",
          url: "https://example.com",
          title: "Company Website",
          createdAt: "2022-01-15T08:35:00Z",
        }
      ],
      files: [],
      seoAnalyses: [
        {
          id: "seo1",
          domainId: "1",
          createdAt: "2023-03-15T10:30:00Z",
          metaTagsScore: 85,
          speedScore: 92,
          mobileScore: 88,
          accessibilityScore: 76,
          seoScore: 82,
          recommendations: [
            "Add alt text to all images",
            "Improve mobile page speed",
            "Fix broken links"
          ]
        }
      ]
    },
    {
      id: "2",
      name: "store-example.com",
      registrar: "Namecheap",
      registeredDate: "2022-02-10",
      expiryDate: "2023-05-10",
      status: "expired",
      autoRenew: false,
      nameservers: [],
      notes: [],
      links: [],
      files: [],
      seoAnalyses: []
    },
    {
      id: "3",
      name: "blog-example.com",
      registrar: "Cloudflare",
      registeredDate: "2023-01-01",
      expiryDate: "2024-06-01",
      status: "expiring-soon",
      autoRenew: true,
      nameservers: ["ns3.cloudflare.com", "ns4.cloudflare.com"],
      notes: [],
      links: [],
      files: [],
      seoAnalyses: []
    }
  ];
};

// Save domains to localStorage
const saveDomainsToStorage = (domains: Domain[]): void => {
  try {
    localStorage.setItem('domains', JSON.stringify(domains));
  } catch (error) {
    console.error("Error saving domains to localStorage:", error);
  }
};

// Initialize domains from localStorage
let domains: Domain[] = loadDomainsFromStorage();

// Calculate domain status based on expiry date
const calculateDomainStatus = (expiryDate: string): DomainStatus => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);
  
  if (expiry < now) {
    return 'expired';
  } else if (expiry < thirtyDaysFromNow) {
    return 'expiring-soon';
  }
  return 'active';
};

// API functions with localStorage support
export const fetchDomains = async (): Promise<Domain[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Artificial delay
  
  // Always use localStorage data
  return domains;
};

export const fetchDomain = async (id: string): Promise<Domain | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return domains.find(domain => domain.id === id);
};

export const createDomain = async (domain: Omit<Domain, 'id' | 'notes' | 'links' | 'files' | 'seoAnalyses'>): Promise<Domain> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newDomain: Domain = {
    ...domain,
    id: uuidv4(),
    status: calculateDomainStatus(domain.expiryDate),
    notes: [],
    links: [],
    files: [],
    seoAnalyses: [],
  };
  
  // Update the in-memory array and localStorage
  domains = [...domains, newDomain];
  saveDomainsToStorage(domains);
  return newDomain;
};

export const updateDomain = async (id: string, updates: Partial<Omit<Domain, 'id' | 'notes' | 'links' | 'files' | 'seoAnalyses'>>): Promise<Domain | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = domains.findIndex(d => d.id === id);
  if (index === -1) return undefined;
  
  const updatedStatus = updates.expiryDate 
    ? calculateDomainStatus(updates.expiryDate) 
    : domains[index].status;
  
  const updatedDomain: Domain = {
    ...domains[index],
    ...updates,
    status: updatedStatus
  };
  
  domains = [
    ...domains.slice(0, index),
    updatedDomain,
    ...domains.slice(index + 1)
  ];
  
  // Save updated domains to localStorage
  saveDomainsToStorage(domains);
  
  return updatedDomain;
};

export const deleteDomain = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const initialLength = domains.length;
  domains = domains.filter(domain => domain.id !== id);
  
  console.log(`Domain deletion attempted: ID ${id}`);
  console.log(`Initial domains count: ${initialLength}, Current count: ${domains.length}`);
  
  // Save updated domains to localStorage after deletion
  if (domains.length < initialLength) {
    saveDomainsToStorage(domains);
  }
  
  // Return true if a domain was actually deleted
  return domains.length < initialLength;
};

// Notes API
export const addDomainNote = async (domainId: string, content: string): Promise<DomainNote | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const domainIndex = domains.findIndex(d => d.id === domainId);
  if (domainIndex === -1) return undefined;
  
  const newNote: DomainNote = {
    id: uuidv4(),
    domainId,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  domains[domainIndex].notes = [...domains[domainIndex].notes, newNote];
  
  // Save updated domains to localStorage
  saveDomainsToStorage(domains);
  
  return newNote;
};

export const deleteDomainNote = async (domainId: string, noteId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const domainIndex = domains.findIndex(d => d.id === domainId);
  if (domainIndex === -1) return false;
  
  const initialLength = domains[domainIndex].notes.length;
  domains[domainIndex].notes = domains[domainIndex].notes.filter(note => note.id !== noteId);
  
  // Save updated domains to localStorage if a note was deleted
  if (domains[domainIndex].notes.length !== initialLength) {
    saveDomainsToStorage(domains);
  }
  
  return domains[domainIndex].notes.length !== initialLength;
};

// Links API
export const addDomainLink = async (domainId: string, url: string, title: string): Promise<DomainLink | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const domainIndex = domains.findIndex(d => d.id === domainId);
  if (domainIndex === -1) return undefined;
  
  const newLink: DomainLink = {
    id: uuidv4(),
    domainId,
    url,
    title,
    createdAt: new Date().toISOString(),
  };
  
  domains[domainIndex].links = [...domains[domainIndex].links, newLink];
  
  // Save updated domains to localStorage
  saveDomainsToStorage(domains);
  
  return newLink;
};

export const deleteDomainLink = async (domainId: string, linkId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const domainIndex = domains.findIndex(d => d.id === domainId);
  if (domainIndex === -1) return false;
  
  const initialLength = domains[domainIndex].links.length;
  domains[domainIndex].links = domains[domainIndex].links.filter(link => link.id !== linkId);
  
  // Save updated domains to localStorage if a link was deleted
  if (domains[domainIndex].links.length !== initialLength) {
    saveDomainsToStorage(domains);
  }
  
  return domains[domainIndex].links.length !== initialLength;
};

// Files API
export const addDomainFile = async (domainId: string, fileName: string, fileSize: number, fileType: string): Promise<DomainFile | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const domainIndex = domains.findIndex(d => d.id === domainId);
  if (domainIndex === -1) return undefined;
  
  const newFile: DomainFile = {
    id: uuidv4(),
    domainId,
    fileName,
    fileSize,
    fileType,
    url: `/files/${fileName}`,
    uploadedAt: new Date().toISOString(),
  };
  
  domains[domainIndex].files = [...domains[domainIndex].files, newFile];
  
  // Save updated domains to localStorage
  saveDomainsToStorage(domains);
  
  return newFile;
};

export const deleteDomainFile = async (domainId: string, fileId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const domainIndex = domains.findIndex(d => d.id === domainId);
  if (domainIndex === -1) return false;
  
  const initialLength = domains[domainIndex].files.length;
  domains[domainIndex].files = domains[domainIndex].files.filter(file => file.id !== fileId);
  
  // Save updated domains to localStorage if a file was deleted
  if (domains[domainIndex].files.length !== initialLength) {
    saveDomainsToStorage(domains);
  }
  
  return domains[domainIndex].files.length !== initialLength;
};

// User API functions
export const fetchUsers = async (): Promise<User[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return users;
};

export const fetchUser = async (id: string): Promise<User | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return users.find(user => user.id === id);
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newUser: User = {
    ...userData,
    id: uuidv4(),
    createdAt: new Date().toISOString()
  };
  
  users = [...users, newUser];
  return newUser;
};

export const updateUser = async (id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return undefined;
  
  const updatedUser: User = {
    ...users[index],
    ...updates
  };
  
  users = [
    ...users.slice(0, index),
    updatedUser,
    ...users.slice(index + 1)
  ];
  
  return updatedUser;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const initialLength = users.length;
  users = users.filter(user => user.id !== id);
  return users.length !== initialLength;
};

// SEO Analysis API
export const runSEOAnalysis = async (domainId: string): Promise<SEOAnalysis | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const domainIndex = domains.findIndex(d => d.id === domainId);
  if (domainIndex === -1) return undefined;
  
  const randomScore = () => Math.floor(Math.random() * 30) + 70;
  
  const recommendations = [
    "Improve meta descriptions for better CTR",
    "Add more high-quality backlinks",
    "Optimize images for faster loading",
    "Fix broken links and 404 errors",
    "Improve mobile responsiveness",
    "Add structured data markup"
  ];
  
  const shuffled = [...recommendations].sort(() => 0.5 - Math.random());
  const selectedRecommendations = shuffled.slice(0, Math.floor(Math.random() * 3) + 2);
  
  const newAnalysis: SEOAnalysis = {
    id: uuidv4(),
    domainId,
    createdAt: new Date().toISOString(),
    metaTagsScore: randomScore(),
    speedScore: randomScore(),
    mobileScore: randomScore(),
    accessibilityScore: randomScore(),
    seoScore: randomScore(),
    recommendations: selectedRecommendations
  };
  
  domains[domainIndex].seoAnalyses = [...domains[domainIndex].seoAnalyses, newAnalysis];
  
  // Save updated domains to localStorage
  saveDomainsToStorage(domains);
  
  return newAnalysis;
};

export const getSEOAnalyses = async (domainId: string): Promise<SEOAnalysis[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const domain = domains.find(d => d.id === domainId);
  return domain?.seoAnalyses || [];
};
