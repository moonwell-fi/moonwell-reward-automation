/**
 * GitHub API integration for creating PRs
 */

import type { EpochConfig } from './types/config';
import type { Env } from './slack/command';
import { generateShellScript } from './generateShellScript';

interface GitHubFile {
  path: string;
  content: string;
}

interface CreatePRResult {
  prUrl: string;
  mipNumber: number;
}

/**
 * Create a pull request with the epoch configuration files
 */
export async function createPullRequest(
  config: EpochConfig,
  env: Env
): Promise<CreatePRResult> {
  const repo = env.GITHUB_REPO || 'moonwell-fi/moonwell-contracts-v2';
  const [owner, repoName] = repo.split('/');

  // Get the next MIP number
  const mipNumber = await getNextMipNumber(owner, repoName, env.GITHUB_TOKEN);

  // Generate the files
  const json = await generateConfigJson(config, env);
  const markdown = await generateConfigMarkdown(config, mipNumber, env);
  const shell = generateShellScript(mipNumber);

  // Create the branch and commit files
  const branchName = `mip-x${mipNumber}`;
  const baseBranch = 'main';

  // Get the base branch SHA
  const baseSha = await getBranchSha(owner, repoName, baseBranch, env.GITHUB_TOKEN);

  // Create the new branch
  await createBranch(owner, repoName, branchName, baseSha, env.GITHUB_TOKEN);

  // Commit the files
  const files: GitHubFile[] = [
    {
      path: `proposals/mips/mip-x${mipNumber}/x${mipNumber}.json`,
      content: json,
    },
    {
      path: `proposals/mips/mip-x${mipNumber}/x${mipNumber}.md`,
      content: markdown,
    },
    {
      path: `proposals/mips/mip-x${mipNumber}/x${mipNumber}.sh`,
      content: shell,
    },
  ];

  await commitFiles(owner, repoName, branchName, files, `Add MIP-X${mipNumber} automated rewards proposal`, env.GITHUB_TOKEN);

  // Update mips.json
  await updateMipsRegistry(owner, repoName, branchName, mipNumber, env.GITHUB_TOKEN);

  // Create the PR
  const prUrl = await createGitHubPR(
    owner,
    repoName,
    {
      title: `MIP-X${mipNumber}: Automated Liquidity Incentive Proposal`,
      body: generatePRDescription(config, mipNumber),
      head: branchName,
      base: baseBranch,
    },
    env.GITHUB_TOKEN
  );

  return { prUrl, mipNumber };
}

/**
 * Get the next MIP-X number by parsing mips.json
 */
async function getNextMipNumber(
  owner: string,
  repo: string,
  token: string
): Promise<number> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/proposals/mips/mips.json`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'moonwell-reward-automation',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get mips.json: ${response.status}`);
  }

  const data = await response.json() as { content: string };
  const content = atob(data.content.replace(/\n/g, ''));
  const mips = JSON.parse(content) as Array<{ path: string }>;

  // Find the highest mip-x number
  let maxMipX = 0;
  for (const mip of mips) {
    const match = mip.path.match(/mip-x(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxMipX) {
        maxMipX = num;
      }
    }
  }

  return maxMipX + 1;
}

/**
 * Get the SHA of a branch
 */
async function getBranchSha(
  owner: string,
  repo: string,
  branch: string,
  token: string
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'moonwell-reward-automation',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get branch SHA: ${response.status}`);
  }

  const data = await response.json() as { object: { sha: string } };
  return data.object.sha;
}

/**
 * Create a new branch
 */
async function createBranch(
  owner: string,
  repo: string,
  branch: string,
  sha: string,
  token: string
): Promise<void> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'moonwell-reward-automation',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create branch: ${response.status} - ${error}`);
  }
}

/**
 * Commit files to a branch
 */
async function commitFiles(
  owner: string,
  repo: string,
  branch: string,
  files: GitHubFile[],
  message: string,
  token: string
): Promise<void> {
  // Get the current commit SHA
  const branchSha = await getBranchSha(owner, repo, branch, token);

  // Get the tree SHA
  const commitResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/commits/${branchSha}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'moonwell-reward-automation',
      },
    }
  );

  if (!commitResponse.ok) {
    throw new Error(`Failed to get commit: ${commitResponse.status}`);
  }

  const commitData = await commitResponse.json() as { tree: { sha: string } };
  const baseTreeSha = commitData.tree.sha;

  // Create blobs for each file
  const treeItems = [];
  for (const file of files) {
    const blobResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'moonwell-reward-automation',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: file.content,
          encoding: 'utf-8',
        }),
      }
    );

    if (!blobResponse.ok) {
      throw new Error(`Failed to create blob: ${blobResponse.status}`);
    }

    const blobData = await blobResponse.json() as { sha: string };
    treeItems.push({
      path: file.path,
      mode: '100644',
      type: 'blob',
      sha: blobData.sha,
    });
  }

  // Create a new tree
  const treeResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'moonwell-reward-automation',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeItems,
      }),
    }
  );

  if (!treeResponse.ok) {
    throw new Error(`Failed to create tree: ${treeResponse.status}`);
  }

  const treeData = await treeResponse.json() as { sha: string };

  // Create the commit
  const newCommitResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/commits`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'moonwell-reward-automation',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        tree: treeData.sha,
        parents: [branchSha],
      }),
    }
  );

  if (!newCommitResponse.ok) {
    throw new Error(`Failed to create commit: ${newCommitResponse.status}`);
  }

  const newCommitData = await newCommitResponse.json() as { sha: string };

  // Update the branch reference
  const updateRefResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'moonwell-reward-automation',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sha: newCommitData.sha,
      }),
    }
  );

  if (!updateRefResponse.ok) {
    throw new Error(`Failed to update branch ref: ${updateRefResponse.status}`);
  }
}

/**
 * Update the mips.json registry
 */
async function updateMipsRegistry(
  owner: string,
  repo: string,
  branch: string,
  mipNumber: number,
  token: string
): Promise<void> {
  // Get current mips.json
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/proposals/mips/mips.json?ref=${branch}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'moonwell-reward-automation',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get mips.json: ${response.status}`);
  }

  const fileData = await response.json() as { content: string; sha: string };
  const content = atob(fileData.content.replace(/\n/g, ''));
  const mips = JSON.parse(content) as Array<{ id: number; path: string }>;

  // Find the max ID
  const maxId = Math.max(...mips.map(m => m.id));

  // Add the new entry
  mips.push({
    id: maxId + 1,
    governor: 'MultichainGovernor',
    path: `proposals/mips/mip-x${mipNumber}/x${mipNumber}.json`,
    proposalType: 'HybridProposal',
    envpath: `proposals/mips/mip-x${mipNumber}/x${mipNumber}.sh`,
  } as any);

  // Update the file
  const updateResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/proposals/mips/mips.json`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'moonwell-reward-automation',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Update mips.json with MIP-X${mipNumber}`,
        content: btoa(JSON.stringify(mips, null, 2)),
        sha: fileData.sha,
        branch,
      }),
    }
  );

  if (!updateResponse.ok) {
    throw new Error(`Failed to update mips.json: ${updateResponse.status}`);
  }
}

/**
 * Create a GitHub PR
 */
async function createGitHubPR(
  owner: string,
  repo: string,
  pr: {
    title: string;
    body: string;
    head: string;
    base: string;
  },
  token: string
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'moonwell-reward-automation',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pr),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create PR: ${response.status} - ${error}`);
  }

  const data = await response.json() as { html_url: string };
  return data.html_url;
}

/**
 * Generate JSON from epoch config
 */
async function generateConfigJson(config: EpochConfig, env: Env): Promise<string> {
  // This would call the existing generation logic
  // For now, return a placeholder
  return JSON.stringify({
    epochNumber: config.epochNumber,
    epochDate: config.epochDate,
    networks: config.networks,
    generatedAt: new Date().toISOString(),
  }, null, 2);
}

/**
 * Generate Markdown from epoch config
 */
async function generateConfigMarkdown(
  config: EpochConfig,
  mipNumber: number,
  env: Env
): Promise<string> {
  // This would call the existing generation logic
  // For now, return a placeholder
  return `# MIP-X${mipNumber} Automated Liquidity Incentive Proposal

This is an automated liquidity incentive governance proposal for the Moonwell protocol.

## Epoch Information

- **Epoch Number:** ${config.epochNumber}
- **Epoch Date:** ${config.epochDate}
- **Generated At:** ${new Date().toISOString()}

## Configuration Summary

${Object.entries(config.networks).map(([chainId, network]) => {
  const enabledMarkets = Object.entries(network.markets)
    .filter(([_, m]) => m.enabled)
    .length;
  const totalBuybacks = Object.values(network.markets)
    .reduce((sum, m) => sum + parseFloat(m.buybackWithdrawal || '0'), 0);

  return `### Chain ${chainId}
- Enabled Markets: ${enabledMarkets}
- Total Buybacks: $${totalBuybacks.toLocaleString()}
`;
}).join('\n')}
`;
}

/**
 * Generate PR description
 */
function generatePRDescription(config: EpochConfig, mipNumber: number): string {
  const totalBuybacks = Object.values(config.networks)
    .flatMap(n => Object.values(n.markets))
    .reduce((sum, m) => sum + parseFloat(m.buybackWithdrawal || '0'), 0);

  return `## Automated Epoch Rewards Proposal

**Epoch:** #${config.epochNumber}
**Date:** ${config.epochDate}
**Created by:** Slack Bot

### Summary
- Total Buybacks: $${totalBuybacks.toLocaleString()}

### Files Added
- \`proposals/mips/mip-x${mipNumber}/x${mipNumber}.json\`
- \`proposals/mips/mip-x${mipNumber}/x${mipNumber}.md\`
- \`proposals/mips/mip-x${mipNumber}/x${mipNumber}.sh\`

### Review Checklist
- [ ] Verify reward distributions are correct
- [ ] Check JSON transaction parameters
- [ ] Review markdown summary

---
*Generated by [moonwell-reward-automation](https://github.com/moonwell-fi/moonwell-reward-automation)*
`;
}
