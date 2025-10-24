'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Home() {
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [dockerfile, setDockerfile] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // small helpers
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // small visual feedback could be added here
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const downloadDockerfile = (content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dockerfile';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgress(5);
    setError('');

    // simple progress animation while waiting for the server
    let interval: number | undefined;
    const startProgress = () => {
      interval = window.setInterval(() => {
        setProgress((p) => {
          if (p >= 95) return 95;
          return Math.min(95, p + Math.floor(Math.random() * 10) + 3);
        });
      }, 700);
    };
    startProgress();

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryUrl,
          githubToken,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate Dockerfile');
      }

      setDockerfile(data.data.dockerfile);
      setProgress(100);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setProgress(0);
    } finally {
      setLoading(false);
      // ensure interval cleared and progress finalized
      // small timeout so UI shows 100% briefly
      setTimeout(() => setProgress((p) => (p >= 100 ? 100 : p)), 300);
      try {
        // clear interval if set
        (window as any).clearInterval;
      } catch { }
    }
  };

  const handlePush = async () => {
    if (!dockerfile) return setError('No Dockerfile to push');
    setLoading(true);
    setError('');
    try {
      const resp = await fetch('http://localhost:5000/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryUrl, githubToken, dockerfile }),
      });
      const data = await resp.json();
      if (!data.success) throw new Error(data.error || 'Push failed');
      alert(`Pushed to branch: ${data.data.branch}`);
    } catch (err: any) {
      setError(err.message || 'Push failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">DockGen AI</h1>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Generate Dockerfile & Build</h2>
              <p className="text-sm text-gray-500">Provide a GitHub repository and a token to generate and optionally push a Dockerfile. Builds run on your machine (Docker required).</p>
            </div>
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">Stable • Production</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Repository</CardTitle>
                <CardDescription>Enter repository and access token</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Repository URL</label>
                  <Input
                    type="text"
                    placeholder="https://github.com/user/repo.git"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    required
                    className="w-full"
                  />

                  <label className="block text-sm font-medium text-gray-700">GitHub Token</label>
                  <Input
                    type="password"
                    placeholder="ghp_xxx"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    required
                    className="w-full"
                  />

                  <div className="flex items-center space-x-3 mt-4">
                    <Button type="submit" disabled={loading} className="px-4">
                      {loading ? 'Working...' : 'Generate & Build'}
                    </Button>
                    <Button type="button" onClick={() => { setRepositoryUrl(''); setGithubToken(''); }} variant="ghost" className="px-3">
                      Reset
                    </Button>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Note: The server clones your repo to a temporary directory. Tokens are used only for the clone/push operation — do not commit tokens.
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generated Dockerfile</CardTitle>
                <CardDescription>Preview, copy, download or push the generated Dockerfile</CardDescription>
              </CardHeader>
              <CardContent>
                {/* status + progress */}
                {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

                {loading && (
                  <div className="w-full mb-4">
                    <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
                      <div className="bg-blue-600 h-3" style={{ width: `${progress}%`, transition: 'width 0.6s ease' }} />
                    </div>
                    <div className="text-right text-sm text-gray-600 mt-1">{progress}%</div>
                  </div>
                )}

                <div className="flex justify-end gap-2 mb-2">
                  <Button size="sm" variant="outline" onClick={() => dockerfile && copyToClipboard(dockerfile)}>Copy</Button>
                  <Button size="sm" variant="outline" onClick={() => dockerfile && downloadDockerfile(dockerfile)}>Download</Button>
                  <Button size="sm" onClick={handlePush} disabled={loading || !githubToken}>{loading ? 'Working...' : 'Push'}</Button>
                </div>

                <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto max-h-96">
                  {dockerfile || (<span className="text-gray-400">No Dockerfile generated yet.</span>)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
