
// Initialize the domains collection with sample data
export async function initializeDomainsCollection(db) {
  const results = {};
  console.log('Server: Adding sample data to domains collection');
  
  // Create some sample domains
  const domainsResult = await db.collection('domains').insertMany([
    {
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
  ]);
  
  console.log(`Server: Domains collection created with ${domainsResult.insertedCount} sample domains`);
  results.domainsCollection = domainsResult.insertedCount;
  
  return results;
}
