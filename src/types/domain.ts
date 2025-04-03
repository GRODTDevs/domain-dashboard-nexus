
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

export interface Domain {
  id: string;
  name: string;
  registrar: string;
  registeredDate: string;
  expiryDate: string;
  status: DomainStatus;
  autoRenew: boolean;
  notes: DomainNote[];
  links: DomainLink[];
  files: DomainFile[];
}
