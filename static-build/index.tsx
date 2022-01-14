/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { h } from 'preact';

import { renderPage, writeFiles } from './utils';
import IndexPage from './pages/index';
import TestPage from './pages/test';
import AboutPage from './pages/about';
import FAQPage from './pages/faqs';
import testData from 'test-data:';

interface Output {
  [outputPath: string]: string;
}
const toOutput: Output = {
  'index.html': renderPage(<IndexPage tests={testData} />),
  'about/index.html': renderPage(<AboutPage />),
  'faqs/index.html': renderPage(<FAQPage />),
};

function getPrevOrNextData(
  testEntry: [string, Test] | 'goto parent' | 'hide end',
): PaginationData {
  if (typeof testEntry === 'object') {
    return {
      link: './../' + testEntry[0] + '/',
      meta: {
        title: testEntry[1].meta.title,
        shortDesc: testEntry[1].meta.shortDesc,
      },
    };
  } else if (testEntry === 'goto parent') {
    return {
      link: '../',
      meta: {
        title: testEntry,
        shortDesc: 'go back',
      },
    };
  } else {
    return {
      link: '/',
      meta: {
        title: testEntry,
        shortDesc: '',
      },
    };
  }
}

function addTestPages(tests: Tests, basePath = '') {
  const testEntries: [string, Test][] = Object.entries(tests);
  const len = testEntries.length;
  for (const [i, [testPath, test]] of testEntries.entries()) {
    const testBasePath = basePath + testPath + '/';

    const prevTest: PaginationData =
      i !== 0
        ? getPrevOrNextData(testEntries[i - 1])
        : getPrevOrNextData('goto parent');

    const nextTest: PaginationData =
      i !== len - 1
        ? getPrevOrNextData(testEntries[i + 1])
        : getPrevOrNextData('hide end');

    test.prevTest = prevTest;
    test.nextTest = nextTest;

    toOutput[testBasePath + 'index.html'] = renderPage(
      <TestPage test={test} />,
    );

    if (test.subTests) addTestPages(test.subTests, testBasePath);
  }
}

addTestPages(testData);
writeFiles(toOutput);
