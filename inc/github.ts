import { GitHubCreateRepoResponse } from '../types';

export async function createGitHubRepo(
  name: string, 
  isPrivate: boolean = false, 
  description: string = ''
): Promise<GitHubCreateRepoResponse> {
  const token = process.env.GITHUB_TOKEN || null;
  const username = process.env.GITHUB_USERNAME || null;

  if (!token || !username) {
    throw new Error('GitHub token and username are required in environment variables');
  }

  const endpoint = 'https://api.github.com/user/repos';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      private: isPrivate,
      description,
      auto_init: true,
    }),
  });

  if (!response.ok) {
    const error: any = await response.json();
    throw new Error(`Failed to create GitHub repository: ${error.message}`);
  }

  const repo: any = await response.json();
  return {
    html_url: repo.html_url,
    clone_url: repo.clone_url,
    ssh_url: repo.ssh_url,
    name: repo.name
  };
}