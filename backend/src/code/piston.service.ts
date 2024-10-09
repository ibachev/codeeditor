import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PistonService {
  private readonly pistonUrl = 'https://emkc.org/api/v2/piston/execute';
  private readonly runtimesUrl = 'https://emkc.org/api/v2/piston/runtimes';

  async executeCode(language: string, code: string) {
    const version = '*';

    console.log('Executing code with language:', language);

    try {
      const response = await axios.post(this.pistonUrl, {
        language: language,
        version: version,
        files: [
          {
            name: 'any.file',
            content: code,
          },
        ],
        stdin: '',
        args: [],
        run_timeout: 3000,
      });

      console.log('Execution result:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to execute code: ${error.message}`);
      throw new Error(`Failed to execute code: ${error.message}`);
    }
  }

  // Method to fetch available runtimes (for testing the connection)
  async getRuntimes() {
    try {
      const response = await axios.get(this.runtimesUrl);
      console.log('Available runtimes:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch runtimes: ${error.message}`);
      throw new Error(`Failed to fetch runtimes: ${error.message}`);
    }
  }
}
