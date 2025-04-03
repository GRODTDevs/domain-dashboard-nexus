
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { runSEOAnalysis, getSEOAnalyses } from "@/lib/api";
import { useState, useEffect } from "react";
import { SEOAnalysis } from "@/types/domain";
import { CheckCircle, ClipboardList, LineChart, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface SEOAnalysisToolProps {
  domainId: string;
  domainName: string;
}

export function SEOAnalysisTool({ domainId, domainName }: SEOAnalysisToolProps) {
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<SEOAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SEOAnalysis | null>(null);
  
  const loadAnalyses = async () => {
    setIsLoading(true);
    try {
      const data = await getSEOAnalyses(domainId);
      setAnalyses(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load SEO analyses.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadAnalyses();
  }, [domainId]);
  
  const handleRunAnalysis = async () => {
    setIsRunningAnalysis(true);
    try {
      const result = await runSEOAnalysis(domainId);
      if (result) {
        toast({
          title: "Success",
          description: "SEO Analysis completed successfully.",
        });
        loadAnalyses();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run SEO analysis.",
        variant: "destructive",
      });
    } finally {
      setIsRunningAnalysis(false);
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };
  
  const getScoreBadgeVariant = (score: number): "success" | "warning" | "destructive" => {
    if (score >= 90) return "success";
    if (score >= 70) return "warning";
    return "destructive";
  };
  
  const getLatestAnalysis = () => {
    if (analyses.length === 0) return null;
    return analyses.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };
  
  const latestAnalysis = getLatestAnalysis();
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>SEO Analysis</span>
            <Button
              onClick={handleRunAnalysis}
              disabled={isRunningAnalysis}
              className="ml-auto"
            >
              {isRunningAnalysis ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <LineChart className="h-4 w-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : analyses.length === 0 ? (
            <EmptyState 
              icon={ClipboardList}
              title="No SEO analyses yet"
              description={`Run an SEO analysis for ${domainName}`}
              className="py-8"
            />
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Latest Analysis</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(latestAnalysis!.createdAt), "PPP")}
                    </div>
                    <Badge variant={getScoreBadgeVariant(latestAnalysis!.seoScore)}>
                      SEO Score: {latestAnalysis!.seoScore}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Meta Tags</span>
                        <span className={getScoreColor(latestAnalysis!.metaTagsScore)}>{latestAnalysis!.metaTagsScore}/100</span>
                      </div>
                      <Progress value={latestAnalysis!.metaTagsScore} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Page Speed</span>
                        <span className={getScoreColor(latestAnalysis!.speedScore)}>{latestAnalysis!.speedScore}/100</span>
                      </div>
                      <Progress value={latestAnalysis!.speedScore} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Mobile Friendly</span>
                        <span className={getScoreColor(latestAnalysis!.mobileScore)}>{latestAnalysis!.mobileScore}/100</span>
                      </div>
                      <Progress value={latestAnalysis!.mobileScore} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Accessibility</span>
                        <span className={getScoreColor(latestAnalysis!.accessibilityScore)}>{latestAnalysis!.accessibilityScore}/100</span>
                      </div>
                      <Progress value={latestAnalysis!.accessibilityScore} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Top Recommendations</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {latestAnalysis!.recommendations.slice(0, 3).map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button
                    variant="link"
                    className="mt-2 p-0 h-auto text-sm"
                    onClick={() => setSelectedAnalysis(latestAnalysis)}
                  >
                    View Full Analysis
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Analysis History</h3>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {analyses
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((analysis) => (
                        <div 
                          key={analysis.id} 
                          className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                          onClick={() => setSelectedAnalysis(analysis)}
                        >
                          <div className="text-sm">
                            {format(new Date(analysis.createdAt), "PPP p")}
                          </div>
                          <Badge variant={getScoreBadgeVariant(analysis.seoScore)}>
                            Score: {analysis.seoScore}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Full Analysis Dialog */}
      <Dialog open={!!selectedAnalysis} onOpenChange={(open) => !open && setSelectedAnalysis(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>SEO Analysis Report</DialogTitle>
            <DialogDescription>
              {selectedAnalysis && format(new Date(selectedAnalysis.createdAt), "PPP p")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAnalysis && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Overall Score</h3>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {selectedAnalysis.seoScore}/100
                  <Badge variant={getScoreBadgeVariant(selectedAnalysis.seoScore)} className="ml-2">
                    {selectedAnalysis.seoScore >= 90 ? "Excellent" : 
                     selectedAnalysis.seoScore >= 70 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Score Breakdown</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Meta Tags & Content</span>
                      <span className={getScoreColor(selectedAnalysis.metaTagsScore)}>{selectedAnalysis.metaTagsScore}/100</span>
                    </div>
                    <Progress value={selectedAnalysis.metaTagsScore} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Page Speed</span>
                      <span className={getScoreColor(selectedAnalysis.speedScore)}>{selectedAnalysis.speedScore}/100</span>
                    </div>
                    <Progress value={selectedAnalysis.speedScore} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Mobile Friendly</span>
                      <span className={getScoreColor(selectedAnalysis.mobileScore)}>{selectedAnalysis.mobileScore}/100</span>
                    </div>
                    <Progress value={selectedAnalysis.mobileScore} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Accessibility</span>
                      <span className={getScoreColor(selectedAnalysis.accessibilityScore)}>{selectedAnalysis.accessibilityScore}/100</span>
                    </div>
                    <Progress value={selectedAnalysis.accessibilityScore} className="h-2" />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Recommendations</h3>
                <ul className="space-y-3">
                  {selectedAnalysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
