import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, TrendingUp, Users, AlertTriangle, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockInsights } from '@/lib/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getTypeConfig = (type: string) => {
    const configs = {
      performance: { label: 'Performance', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
      audience: { label: 'Público', icon: Users, color: 'bg-purple-100 text-purple-700' },
      recommendation: { label: 'Recomendação', icon: Lightbulb, color: 'bg-green-100 text-green-700' },
      alert: { label: 'Alerta', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-700' },
      opportunity: { label: 'Oportunidade', icon: TrendingUp, color: 'bg-cyan-100 text-cyan-700' },
    };
    return configs[type as keyof typeof configs] || configs.performance;
  };

  const filteredInsights = mockInsights.filter((insight) => {
    const matchesSearch = insight.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || insight.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredInsights.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInsights = filteredInsights.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Histórico de Insights</h1>
            <p className="text-muted-foreground mt-1">
              Visualize todos os insights recebidos das suas campanhas
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar insights..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="audience">Público</SelectItem>
                    <SelectItem value="recommendation">Recomendação</SelectItem>
                    <SelectItem value="alert">Alerta</SelectItem>
                    <SelectItem value="opportunity">Oportunidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {paginatedInsights.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum insight encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedInsights.map((insight) => {
                    const config = getTypeConfig(insight.type);
                    const Icon = config.icon;
                    return (
                      <Card key={insight.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${config.color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={config.color}>{config.label}</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(insight.date), "dd 'de' MMMM 'às' HH:mm", {
                                      locale: ptBR,
                                    })}
                                  </span>
                                </div>
                                <CardTitle className="text-base">{insight.summary}</CardTitle>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">CTR</p>
                              <p className="font-semibold">{insight.metrics.ctr}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">CPC</p>
                              <p className="font-semibold">R$ {insight.metrics.cpc}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">ROAS</p>
                              <p className="font-semibold">{insight.metrics.roas}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredInsights.length)} de{' '}
                    {filteredInsights.length} insights
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default History;
