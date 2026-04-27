import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const script = readFileSync('./vechain-iot-loadtest.k6.js', 'utf8');
writeFileSync('./.k6-temp.js', script);

const result = spawnSync('docker', [
  'run', '--rm',
  '--add-host=host.docker.internal:host-gateway',
  '-v', `${process.cwd().replace(/\\/g, '/')}/.k6-temp.js:/script.js:ro`,
  'grafana/k6:latest',
  'run', '/script.js'
], { stdio: 'inherit', shell: false });

process.exit(result.status ?? 1);
