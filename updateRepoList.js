if (!globalThis.fetch) throw Error('update your node to version >=18')
const fs = require('fs')
const cp = require('child_process')

const exec = cmd => (console.log('> ', cmd), cp.execSync(cmd, {stdio:'inherit'}))

const blockedRepos = ['MineflayerArmorManager', 'prismarinejs.github.io', 'prismarine-repo-actions']
const yearInMs = 31556926000

async function main(add) {
  const currentRepos = JSON.parse(fs.readFileSync('./.meta')).projects
  const repos = await fetch('https://api.github.com/orgs/prismarinejs/repos?per_page=100').then(r => r.json())
  // console.log('Repos', repos)
  for (const repo of repos) {
    const msSinceUpdated = Date.now() - new Date(repo.pushed_at)
    // console.log('ms since updated', repo.name, msSinceUpdated)
    if (repo.language && ['javascript', 'typescript'].includes(repo.language.toLowerCase()) 
      && !repo.fork && msSinceUpdated < yearInMs) {
      if (!currentRepos[repo.name] && !blockedRepos.includes(repo.name)) {
        console.log('Do not have', repo.name, 'added yet', 'last updated', msSinceUpdated / (1000 * 60 * 60 * 24), 'days ago')
        if (add) {
          console.log('adding... ')
          exec(`npm run meta project import ${repo.name} ${repo.clone_url}`, {stdio:'inherit'})
        }
      }
    }
  }
}

main(process.argv.includes('add'))