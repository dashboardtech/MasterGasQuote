import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Plus, FileText, ExternalLink, Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Quote } from "@shared/schema";

export default function QuotesPage() {
  const { toast } = useToast();
  const [quoteToDelete, setQuoteToDelete] = useState<number | null>(null);
  
  const { data: quotes, isLoading } = useQuery<Quote[]>({ 
    queryKey: ['/api/quotes'] 
  });

  const handleDeleteQuote = async () => {
    if (!quoteToDelete) return;
    
    try {
      await apiRequest('DELETE', `/api/quotes/${quoteToDelete}`);
      
      toast({
        title: "Quote deleted",
        description: "The quote has been successfully deleted.",
      });
      
      // Invalidate and refetch quotes
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      setQuoteToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary font-ibm">Quotes</h1>
          <p className="text-[#718096]">Manage and create gas station quotes</p>
        </div>
        <Link href="/quotes/new">
          <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
            <Plus className="h-4 w-4 mr-2" /> New Quote
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quotes</CardTitle>
          <CardDescription>View and manage all your quotes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
            </div>
          ) : quotes && quotes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.name}</TableCell>
                    <TableCell>{quote.client || "—"}</TableCell>
                    <TableCell>{quote.location || "—"}</TableCell>
                    <TableCell>
                      {quote.createdAt 
                        ? formatDate(quote.createdAt)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        quote.status === "draft" 
                          ? "bg-blue-100 text-blue-800" 
                          : quote.status === "sent" 
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {quote.status || "draft"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/quotes/${quote.id}`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" /> View
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => setQuoteToDelete(quote.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this quote and all of its components. 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setQuoteToDelete(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={handleDeleteQuote}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-1">No quotes yet</h3>
              <p className="text-[#718096] mb-4">Create your first quote to get started</p>
              <Link href="/quotes/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Create Quote
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
