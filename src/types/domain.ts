
export type DomainStatus = 'active' | 'expiring-soon' | 'expired' | 'inactive';

export interface DomainNote {
  id: string;
  domainId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface DomainLink {
  id: string;
  domainId: string;
  url: string;
  title: string;
  createdAt: string;
}

export interface DomainFile {
  id: string;
  domainId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadedAt: string;
}

export interface SEOAnalysis {
  id: string;
  domainId: string;
  createdAt: string;
  metaTagsScore: number;
  speedScore: number;
  mobileScore: number;
  accessibilityScore: number;
  seoScore: number;
  recommendations: string[];
}

export interface Domain {
  id: string;
  name: string;
  registrar: string;
  registeredDate: string;
  expiryDate: string;
  status: DomainStatus;
  autoRenew: boolean;
  nameservers: string[];
  notes: DomainNote[];
  links: DomainLink[];
  files: DomainFile[];
  seoAnalyses: SEOAnalysis[];
}
