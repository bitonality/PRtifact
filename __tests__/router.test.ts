import { jest } from '@jest/globals'
import { ReportDestination, ReportProcessor, Artifact } from '../src/index'
import { Router } from '../src/destinations/router'

describe('Router', () => {
  let router: Router<string>
  let mockProcessor: ReportProcessor<string>
  let mockDestination: ReportDestination<string>
  let mockArtifact: Artifact

  beforeEach(() => {
    router = new Router<string>()
    mockProcessor = {
      generateReport:
        jest.fn<(artifacts: readonly Artifact[]) => Promise<string>>()
    }
    mockDestination = {
      uploadReport: jest.fn<(report: string) => Promise<void>>()
    }
    mockArtifact = {
      // Add properties that match the expected structure of Artifact
      id: 1,
      name: 'artifact1'
      // other properties as needed
    } as Artifact
  })

  describe('registerRoute', () => {
    it('should add a new route', () => {
      router.registerRoute(mockProcessor, mockDestination)

      expect(router['routes'].has(mockProcessor)).toBe(true)
      expect(router['routes'].get(mockProcessor)).toEqual([mockDestination])
    })

    it('should append to an existing route', () => {
      const anotherDestination: ReportDestination<string> = {
        uploadReport: jest.fn<(report: string) => Promise<void>>()
      }

      router.registerRoute(mockProcessor, mockDestination)
      router.registerRoute(mockProcessor, anotherDestination)

      expect(router['routes'].get(mockProcessor)).toEqual([
        mockDestination,
        anotherDestination
      ])
    })
  })

  describe('uploadReport', () => {
    it('should process and upload reports to all destinations', async () => {
      const mockResult = 'mockReport'
      ;(
        mockProcessor.generateReport as jest.Mock<
          (artifacts: readonly Artifact[]) => Promise<string>
        >
      ).mockResolvedValue(mockResult)

      router.registerRoute(mockProcessor, mockDestination)
      await router.uploadReport([mockArtifact])

      expect(mockProcessor.generateReport).toHaveBeenCalledWith([mockArtifact])
      expect(mockDestination.uploadReport).toHaveBeenCalledWith(mockResult)
    })

    it('should handle errors in report processing and uploading', async () => {
      const mockError = new Error('Mock Error')
      ;(
        mockProcessor.generateReport as jest.Mock<
          (artifacts: readonly Artifact[]) => Promise<string>
        >
      ).mockRejectedValue(mockError)

      router.registerRoute(mockProcessor, mockDestination)

      await expect(router.uploadReport([mockArtifact])).rejects.toThrow(
        AggregateError
      )
      expect(mockProcessor.generateReport).toHaveBeenCalledWith([mockArtifact])
    })

    it('should handle errors in multiple destinations', async () => {
      const mockError1 = new Error('Mock Error 1')
      const mockError2 = new Error('Mock Error 2')
      ;(
        mockProcessor.generateReport as jest.Mock<
          (artifacts: readonly Artifact[]) => Promise<string>
        >
      ).mockResolvedValue('mockReport')
      ;(
        mockDestination.uploadReport as jest.Mock<
          (report: string) => Promise<void>
        >
      ).mockRejectedValueOnce(mockError1)

      const anotherDestination: ReportDestination<string> = {
        uploadReport: jest
          .fn<(report: string) => Promise<void>>()
          .mockRejectedValueOnce(mockError2)
      }

      router.registerRoute(mockProcessor, mockDestination)
      router.registerRoute(mockProcessor, anotherDestination)

      await expect(router.uploadReport([mockArtifact])).rejects.toThrow(
        AggregateError
      )

      expect(mockProcessor.generateReport).toHaveBeenCalledWith([mockArtifact])
      expect(mockDestination.uploadReport).toHaveBeenCalledWith('mockReport')
      expect(anotherDestination.uploadReport).toHaveBeenCalledWith('mockReport')
    })
  })
})
