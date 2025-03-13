import { describe, it, expect } from 'vitest';
import { LICENSE_CONFIG } from '../../../../src/domain/constant/license-config.constant';
import { ELicense } from '../../../../src/domain/enum/license.enum';

describe('LICENSE_CONFIG constant', () => {
  const testYear = '2023';
  const testAuthor = 'Test Author';

  // Test for all available licenses
  it('should have configurations for all licenses in the ELicense enum', () => {
    Object.values(ELicense).forEach(license => {
      expect(LICENSE_CONFIG[license]).toBeDefined();
      expect(LICENSE_CONFIG[license].name).toBeDefined();
      expect(LICENSE_CONFIG[license].description).toBeDefined();
      expect(typeof LICENSE_CONFIG[license].template).toBe('function');
    });
  });

  // Test each license template function
  describe('AGPL 3.0 License', () => {
    it('should generate correct AGPL 3.0 license template', () => {
      const template = LICENSE_CONFIG[ELicense.AGPL_3_0].template(testYear, testAuthor);
      
      expect(template).toContain('GNU AFFERO GENERAL PUBLIC LICENSE');
      expect(template).toContain('Version 3, 19 November 2007');
      expect(template).toContain(`Copyright (c) ${testYear} ${testAuthor}`);
    });
  });

  describe('Apache 2.0 License', () => {
    it('should generate correct Apache 2.0 license template', () => {
      const template = LICENSE_CONFIG[ELicense.APACHE_2_0].template(testYear, testAuthor);
      
      expect(template).toContain('Apache License');
      expect(template).toContain('Version 2.0, January 2004');
      // The Apache template contains the copyright in a different format
      expect(template).toContain(`Copyright (c) ${testYear} ${testAuthor}`);
    });
  });

  describe('BSL 1.0 License', () => {
    it('should generate correct BSL 1.0 license template', () => {
      const template = LICENSE_CONFIG[ELicense.BSL_1_0].template(testYear, testAuthor);
      
      expect(template).toContain('Boost Software License - Version 1.0');
      expect(template).toContain(`Copyright (c) ${testYear} ${testAuthor}`);
    });
  });

  describe('GPL 3.0 License', () => {
    it('should generate correct GPL 3.0 license template', () => {
      const template = LICENSE_CONFIG[ELicense.GPL_3_0].template(testYear, testAuthor);
      
      expect(template).toContain('GNU GENERAL PUBLIC LICENSE');
      expect(template).toContain('Version 3, 29 June 2007');
      expect(template).toContain(`Copyright (c) ${testYear} ${testAuthor}`);
    });
  });

  describe('ISC License', () => {
    it('should generate correct ISC license template', () => {
      const template = LICENSE_CONFIG[ELicense.ISC].template(testYear, testAuthor);
      
      expect(template).toContain('ISC License');
      expect(template).toContain(`Copyright (c) ${testYear} ${testAuthor}`);
    });
  });

  describe('LGPL 3.0 License', () => {
    it('should generate correct LGPL 3.0 license template', () => {
      const template = LICENSE_CONFIG[ELicense.LGPL_3_0].template(testYear, testAuthor);
      
      expect(template).toContain('GNU LESSER GENERAL PUBLIC LICENSE');
      expect(template).toContain('Version 3, 29 June 2007');
      expect(template).toContain(`Copyright (c) ${testYear} ${testAuthor}`);
    });
  });

  describe('MIT License', () => {
    it('should generate correct MIT license template', () => {
      const template = LICENSE_CONFIG[ELicense.MIT].template(testYear, testAuthor);
      
      expect(template).toContain('MIT License');
      expect(template).toContain(`Copyright (c) ${testYear} ${testAuthor}`);
    });
  });

  describe('MPL 2.0 License', () => {
    it('should generate correct MPL 2.0 license template', () => {
      const template = LICENSE_CONFIG[ELicense.MPL_2_0].template(testYear, testAuthor);
      
      expect(template).toContain('Mozilla Public License Version 2.0');
      expect(template).toContain(`This Source Code Form is subject to the terms of the Mozilla Public`);
    });
  });

  describe('UNLICENSED', () => {
    it('should generate correct UNLICENSED template', () => {
      const template = LICENSE_CONFIG[ELicense.UNLICENSED].template(testYear, testAuthor);
      
      // The UNLICENSED template uses public domain text
      expect(template).toContain('free and unencumbered software');
      expect(template).toContain('public domain');
      
      // Note: The UNLICENSED template doesn't include the author/year placeholders directly
      // The Unlicense is meant to be a public domain dedication
      expect(template).toContain('THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND');
    });
  });
});